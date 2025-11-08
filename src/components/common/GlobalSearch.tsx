import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp, FiClock } from 'react-icons/fi';
import { SearchService, SearchResult } from '../../services/searchService';
import { useAuth } from '../../contexts/AuthContext';

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent and trending searches on mount
  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search when query changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 2) {
        await performSearch(query);
      } else {
        setResults([]);
        setSuggestions([]);
      }
    }, 300); // Debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const loadInitialData = async () => {
    if (user) {
      const recent = await SearchService.getRecentSearches(user.id);
      setRecentSearches(recent);
    }

    const trending = await SearchService.getTrendingSearches();
    setTrendingSearches(trending);
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const [searchResults, searchSuggestions] = await Promise.all([
        SearchService.globalSearch(searchQuery),
        SearchService.getSearchSuggestions(searchQuery),
      ]);

      setResults(searchResults);
      setSuggestions(searchSuggestions);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Save to history
    if (user) {
      await SearchService.saveSearchHistory(user.id, searchQuery);
    }

    // Navigate to products page with search query
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleResultClick = (result: SearchResult) => {
    if (user) {
      SearchService.saveSearchHistory(user.id, result.title);
    }
    
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '🛒';
      case 'category':
        return '📂';
      case 'page':
        return '📄';
      default:
        return '🔍';
    }
  };

  return (
    <SearchContainer ref={searchRef}>
      <SearchInputWrapper>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <ClearButton onClick={clearSearch}>
            <FiX />
          </ClearButton>
        )}
      </SearchInputWrapper>

      {isOpen && (
        <SearchDropdown>
          {isLoading && (
            <LoadingMessage>Searching...</LoadingMessage>
          )}

          {!isLoading && query.trim().length >= 2 && results.length > 0 && (
            <ResultsSection>
              <SectionTitle>Results</SectionTitle>
              {results.map((result, index) => (
                <ResultItem
                  key={result.id}
                  $selected={index === selectedIndex}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <ResultIcon>{getResultIcon(result.type)}</ResultIcon>
                  <ResultContent>
                    <ResultTitle>{result.title}</ResultTitle>
                    {result.description && (
                      <ResultDescription>{result.description}</ResultDescription>
                    )}
                    {result.price && (
                      <ResultPrice>${result.price.toFixed(2)}</ResultPrice>
                    )}
                  </ResultContent>
                  {result.imageUrl && (
                    <ResultImage src={result.imageUrl} alt={result.title} />
                  )}
                </ResultItem>
              ))}
            </ResultsSection>
          )}

          {!isLoading && query.trim().length >= 2 && results.length === 0 && (
            <EmptyState>
              <p>No results found for "{query}"</p>
              <p>Try searching for something else</p>
            </EmptyState>
          )}

          {!query && recentSearches.length > 0 && (
            <SuggestionsSection>
              <SectionTitle>
                <FiClock /> Recent Searches
              </SectionTitle>
              {recentSearches.map((search, index) => (
                <SuggestionItem
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearchSubmit(search);
                  }}
                >
                  <FiClock />
                  {search}
                </SuggestionItem>
              ))}
            </SuggestionsSection>
          )}

          {!query && trendingSearches.length > 0 && (
            <SuggestionsSection>
              <SectionTitle>
                <FiTrendingUp /> Trending Searches
              </SectionTitle>
              {trendingSearches.slice(0, 5).map((search, index) => (
                <SuggestionItem
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearchSubmit(search);
                  }}
                >
                  <FiTrendingUp />
                  {search}
                </SuggestionItem>
              ))}
            </SuggestionsSection>
          )}
        </SearchDropdown>
      )}
    </SearchContainer>
  );
};

export default GlobalSearch;

// Styled Components
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #636E72;
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 3rem;
  border: 2px solid #DFE6E9;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #6C9A7F;
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.15);
  }

  &::placeholder {
    color: #B2BEC3;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #636E72;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: #F8F9FA;
    color: #2D3436;
  }
`;

const SearchDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;

  @media (max-width: 768px) {
    max-height: 400px;
  }
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #636E72;
`;

const ResultsSection = styled.div`
  padding: 0.5rem 0;
`;

const SectionTitle = styled.div`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResultItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $selected }) => ($selected ? '#F0F7F5' : 'white')};

  &:hover {
    background: #F0F7F5;
  }
`;

const ResultIcon = styled.div`
  font-size: 1.5rem;
`;

const ResultContent = styled.div`
  flex: 1;
`;

const ResultTitle = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const ResultDescription = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultPrice = styled.div`
  font-weight: 700;
  color: #6C9A7F;
  margin-top: 0.25rem;
`;

const ResultImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #636E72;

  p:first-child {
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 0.5rem;
  }
`;

const SuggestionsSection = styled.div`
  padding: 0.5rem 0;
  border-top: 1px solid #F8F9FA;
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: #636E72;
  transition: all 0.2s ease;

  svg {
    font-size: 1rem;
  }

  &:hover {
    background: #F8F9FA;
    color: #2D3436;
  }
`;
