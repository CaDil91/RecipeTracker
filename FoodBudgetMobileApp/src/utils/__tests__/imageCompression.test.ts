import { compressImage } from '../imageCompression';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

jest.mock('expo-file-system');

describe('imageCompression', () => {
  // Get mock functions from the global setup
  let mockManipulate: jest.Mock;
  let mockResize: jest.Mock;
  let mockRenderAsync: jest.Mock;
  let mockSaveAsync: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get references to the mocked functions
    mockManipulate = ImageManipulator.manipulate as jest.Mock;
    mockResize = jest.fn();
    mockRenderAsync = jest.fn();
    mockSaveAsync = jest.fn();

    // Set up the API chain
    // manipulate() returns a context with resize() and renderAsync()
    mockManipulate.mockReturnValue({
      resize: mockResize,
      renderAsync: mockRenderAsync,
    });

    // resize() returns the context for chaining
    mockResize.mockReturnValue({
      resize: mockResize,
      renderAsync: mockRenderAsync,
    });

    // renderAsync() returns an image with saveAsync()
    mockRenderAsync.mockResolvedValue({
      saveAsync: mockSaveAsync,
    });

    // Default successful save result
    mockSaveAsync.mockResolvedValue({
      uri: 'file:///path/to/compressed.jpg',
      width: 1920,
      height: 1080,
    });

    // Mock FileSystem.getInfoAsync to return file size
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: 500000, // 500KB
    });
  });

  /**
   * Risk-Based Priority
   * Test high-risk, high-value code first: complex business logic, frequently changing code,
   * previously buggy code, critical workflows
   */
  describe('Risk-Based Priority', () => {
    it('given landscape image exceeding max width, when compressed, then resizes by width to 1920', async () => {
      // Arrange
      const imageUri = 'file:///path/to/large-landscape.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1920,
        height: 1080,
      });

      // Act
      const result = await compressImage(imageUri, {
        width: 3840,
        height: 2160,
      });

      // Assert
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).toHaveBeenCalledWith({ width: 1920 });
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      expect(result.uri).toBe(compressedUri);
    });

    it('given portrait image exceeding max height, when compressed, then resizes by height to 1920', async () => {
      // Arrange
      const imageUri = 'file:///path/to/tall-portrait.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1080,
        height: 1920,
      });

      // Act
      const result = await compressImage(imageUri, {
        width: 2160,
        height: 3840,
      });

      // Assert
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).toHaveBeenCalledWith({ height: 1920 });
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      expect(result.uri).toBe(compressedUri);
    });

    it('given square image exceeding max dimensions, when compressed, then resizes to 1920x1920', async () => {
      // Arrange
      const imageUri = 'file:///path/to/large-square.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1920,
        height: 1920,
      });

      // Act
      const result = await compressImage(imageUri, {
        width: 4000,
        height: 4000,
      });

      // Assert
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).toHaveBeenCalledWith({ width: 1920 });
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      expect(result.uri).toBe(compressedUri);
    });
  });

  /**
   * Happy Path
   * Test the primary use case that delivers business value
   */
  describe('Happy Path', () => {
    it('given small image within limits, when compressed, then no resize action applied', async () => {
      // Arrange
      const imageUri = 'file:///path/to/small-image.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 800,
        height: 600,
      });

      // Act
      const result = await compressImage(imageUri, {
        width: 800,
        height: 600,
      });

      // Assert
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).not.toHaveBeenCalled(); // No resize needed
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      expect(result.uri).toBe(compressedUri);
    });

    it('given any image, when compressed, then sets JPEG format with quality 0.8', async () => {
      // Arrange
      const imageUri = 'file:///path/to/image.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1200,
        height: 900,
      });

      // Act
      await compressImage(imageUri, {
        width: 1200,
        height: 900,
      });

      // Assert
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
    });

    it('given valid image, when compressed successfully, then returns result with uri, dimensions, and file size', async () => {
      // Arrange
      const imageUri = 'file:///path/to/image.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';
      const expectedWidth = 1920;
      const expectedHeight = 1080;
      const expectedFileSize = 500000; // 500KB

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: expectedWidth,
        height: expectedHeight,
      });

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: expectedFileSize,
      });

      // Act
      const result = await compressImage(imageUri, {
        width: 3840,
        height: 2160,
      });

      // Assert
      expect(result.uri).toBe(compressedUri);
      expect(result.width).toBe(expectedWidth);
      expect(result.height).toBe(expectedHeight);
      expect(result.fileSize).toBe(expectedFileSize);
      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(compressedUri);
    });

    it('given FileSystem.getInfoAsync fails, when compressed, then falls back to original fileSize', async () => {
      // Arrange
      const imageUri = 'file:///path/to/image.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';
      const originalFileSize = 1000000; // 1MB

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1920,
        height: 1080,
      });

      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(
        new Error('File system error')
      );

      // Act
      const result = await compressImage(imageUri, {
        width: 3840,
        height: 2160,
        fileSize: originalFileSize,
      });

      // Assert
      expect(result.fileSize).toBe(originalFileSize);
    });
  });

  /**
   * Boundaries
   * Test minimum, maximum, and threshold values for your domain
   */
  describe('Boundaries', () => {
    it('given exactly 1920x1920 dimensions, when compressed, then no resize action applied', async () => {
      // Arrange
      const imageUri = 'file:///path/to/image.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1920,
        height: 1920,
      });

      // Act
      const result = await compressImage(imageUri, {
        width: 1920,
        height: 1920,
      });

      // Assert
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).not.toHaveBeenCalled(); // No resize at exactly max dimensions
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      expect(result.uri).toBe(compressedUri);
    });

    it('given 1921x1080 dimensions (width exceeds by 1), when compressed, then resizes by width', async () => {
      // Arrange
      const imageUri = 'file:///path/to/image.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1920,
        height: 1079,
      });

      // Act
      await compressImage(imageUri, {
        width: 1921,
        height: 1080,
      });

      // Assert
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).toHaveBeenCalledWith({ width: 1920 });
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
    });

    it('given 1080x1921 dimensions (height exceeds by 1), when compressed, then resizes by height', async () => {
      // Arrange
      const imageUri = 'file:///path/to/image.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1079,
        height: 1920,
      });

      // Act
      await compressImage(imageUri, {
        width: 1080,
        height: 1921,
      });

      // Assert
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).toHaveBeenCalledWith({ height: 1920 });
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given image with width > height, when resize needed, then maintains aspect ratio by constraining width only', async () => {
      // Arrange
      const imageUri = 'file:///path/to/landscape.jpg';
      const compressedUri = 'file:///path/to/compressed.jpg';

      mockSaveAsync.mockResolvedValue({
        uri: compressedUri,
        width: 1920,
        height: 1080,
      });

      // Act
      await compressImage(imageUri, {
        width: 3840, // 16:9 aspect ratio
        height: 2160,
      });

      // Assert
      // Should resize by width only, expo-image-manipulator maintains aspect ratio
      expect(mockManipulate).toHaveBeenCalledWith(imageUri);
      expect(mockResize).toHaveBeenCalledWith({ width: 1920 });
      expect(mockRenderAsync).toHaveBeenCalled();
      expect(mockSaveAsync).toHaveBeenCalledWith({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
    });
  });

  /**
   * Errors
   * Verify appropriate error responses and cleanup behavior
   */
  describe('Errors', () => {
    it('given renderAsync fails, when compression attempted, then propagates error', async () => {
      // Arrange
      const imageUri = 'file:///path/to/image.jpg';
      const compressionError = new Error('Image manipulation failed');

      mockRenderAsync.mockRejectedValue(compressionError);

      // Act & Assert
      await expect(
        compressImage(imageUri, {
          width: 3840,
          height: 2160,
        })
      ).rejects.toThrow('Image manipulation failed');
    });

    it('given invalid URI, when compression attempted, then propagates error from saveAsync', async () => {
      // Arrange
      const invalidUri = 'invalid-uri';

      mockSaveAsync.mockRejectedValue(new Error('Invalid image URI'));

      // Act & Assert
      await expect(
        compressImage(invalidUri, {
          width: 1920,
          height: 1080,
        })
      ).rejects.toThrow('Invalid image URI');
    });
  });
});
