import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { imageService } from '../../services/imageService';
import toast from '../common/Toast';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  productId?: string;
  label?: string;
  helpText?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  productId,
  label = 'Product Image',
  helpText = 'Upload JPG, PNG, or WebP (max 5MB)',
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file
    const validation = imageService.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      // Compress image first
      const compressedFile = await imageService.compressImage(file, 800);
      
      // Upload to storage
      const imageUrl = await imageService.uploadProductImage(compressedFile, productId);
      
      if (imageUrl) {
        onImageUploaded(imageUrl);
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Notify parent that image has been removed
    onImageUploaded('');
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <Label>{label}</Label>
      {helpText && <HelpText>{helpText}</HelpText>}

      {preview ? (
        <PreviewContainer>
          <PreviewImage src={preview} alt="Preview" />
          <PreviewOverlay>
            <RemoveButton onClick={handleRemove} type="button">
              <FiX /> Remove
            </RemoveButton>
            <ChangeButton onClick={handleButtonClick} type="button">
              <FiUpload /> Change
            </ChangeButton>
          </PreviewOverlay>
          {uploading && (
            <UploadingOverlay>
              <Spinner />
              <UploadingText>Uploading...</UploadingText>
            </UploadingOverlay>
          )}
        </PreviewContainer>
      ) : (
        <UploadArea
          $dragActive={dragActive}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <UploadIcon>
            <FiUpload />
          </UploadIcon>
          <UploadText>
            {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
          </UploadText>
          <UploadSubtext>{helpText}</UploadSubtext>
        </UploadArea>
      )}

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleChange}
      />
    </Container>
  );
};

export default ImageUpload;

// Styled Components
const Container = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2D3436;
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.75rem;
`;

const UploadArea = styled.div<{ $dragActive: boolean }>`
  border: 2px dashed ${({ $dragActive }) => ($dragActive ? '#6C9A7F' : '#DFE6E9')};
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${({ $dragActive }) => ($dragActive ? '#F0F7F5' : '#FAFBFC')};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #6C9A7F;
    background: #F0F7F5;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #6C9A7F;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.p`
  font-size: 0.875rem;
  color: #636E72;
`;

const PreviewContainer = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover > div:nth-child(2) {
    opacity: 1;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
`;

const PreviewOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const RemoveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #E74C3C;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #C0392B;
    transform: translateY(-2px);
  }
`;

const ChangeButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
`;

const UploadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6C9A7F;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const UploadingText = styled.p`
  font-weight: 600;
  color: #6C9A7F;
`;

const HiddenInput = styled.input`
  display: none;
`;
