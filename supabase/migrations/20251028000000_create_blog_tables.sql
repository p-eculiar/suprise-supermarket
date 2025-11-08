-- Create blog categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    reading_time INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog post likes table
CREATE TABLE IF NOT EXISTS blog_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post ON blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_user ON blog_post_likes(user_id);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for blog post likes
CREATE POLICY "Users can view blog post likes" ON blog_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create blog post likes" ON blog_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blog post likes" ON blog_post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions for blog post likes
GRANT SELECT ON blog_post_likes TO anon, authenticated;
GRANT ALL ON blog_post_likes TO authenticated;

-- Create policies for blog categories (public read, admin write)
CREATE POLICY "Anyone can view blog categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog categories" ON blog_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for blog posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for blog comments
CREATE POLICY "Anyone can view approved blog comments" ON blog_comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create blog comments" ON blog_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blog comments" ON blog_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blog comments" ON blog_comments
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all blog comments" ON blog_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT ON blog_categories TO anon, authenticated;
GRANT ALL ON blog_categories TO authenticated;

GRANT SELECT ON blog_posts TO anon, authenticated;
GRANT ALL ON blog_posts TO authenticated;

GRANT SELECT ON blog_comments TO anon, authenticated;
GRANT ALL ON blog_comments TO authenticated;

-- Create function to get comment count for a post
CREATE OR REPLACE FUNCTION get_blog_post_comment_count(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    comment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO comment_count
    FROM blog_comments
    WHERE post_id = $1 AND status = 'approved';
    
    RETURN COALESCE(comment_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get reply count for a comment
CREATE OR REPLACE FUNCTION get_blog_comment_reply_count(comment_id UUID)
RETURNS INTEGER AS $$
DECLARE
    reply_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO reply_count
    FROM blog_comments
    WHERE parent_id = $1 AND status = 'approved';
    
    RETURN COALESCE(reply_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
    ('Shopping Tips', 'shopping-tips', 'Helpful tips and tricks for smarter shopping'),
    ('Product Guides', 'product-guides', 'Detailed guides on our products and services'),
    ('Health & Wellness', 'health-wellness', 'Health and wellness advice for better living'),
    ('Home & Kitchen', 'home-kitchen', 'Tips for organizing and improving your home and kitchen'),
    ('Budgeting', 'budgeting', 'Money-saving tips and budgeting advice'),
    ('Recipes', 'recipes', 'Delicious recipes using our products'),
    ('Lifestyle', 'lifestyle', 'Lifestyle tips and trends')
ON CONFLICT (slug) DO NOTHING;

-- Create trigger to automatically set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_published_at_trigger
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();