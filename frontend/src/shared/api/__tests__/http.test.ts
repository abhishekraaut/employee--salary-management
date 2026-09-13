import { describe, expect, it, vi, beforeEach } from 'vitest';
import { api } from '../http';
import { axiosInstance } from '../axios';

vi.mock('../axios', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('Typed HTTP Abstraction (api)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs GET request correctly', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: 'get-data' });
    const result = await api.get('/test-get');
    expect(axiosInstance.get).toHaveBeenCalledWith('/test-get', undefined);
    expect(result).toBe('get-data');
  });

  it('performs POST request correctly', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: 'post-data' });
    const payload = { test: 1 };
    const result = await api.post('/test-post', payload);
    expect(axiosInstance.post).toHaveBeenCalledWith('/test-post', payload, undefined);
    expect(result).toBe('post-data');
  });

  it('performs FormData request without manual boundary', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: 'form-data-res' });
    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.txt');
    const result = await api.formData('/upload', formData);
    
    // We pass it directly to axios.post, letting axios set the multipart boundary
    expect(axiosInstance.post).toHaveBeenCalledWith('/upload', formData, undefined);
    expect(result).toBe('form-data-res');
  });

  it('performs Blob request with responseType blob', async () => {
    const blobResponse = new Blob(['csv data']);
    (axiosInstance.get as any).mockResolvedValueOnce({ data: blobResponse });
    const result = await api.blob('/download');
    
    expect(axiosInstance.get).toHaveBeenCalledWith('/download', { responseType: 'blob' });
    expect(result).toBe(blobResponse);
  });
});