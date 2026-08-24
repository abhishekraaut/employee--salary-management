import { describe, it, expect, vi } from 'vitest';
import { axiosBaseQuery } from '../axiosBaseQuery';
import { axiosInstance } from '../axios';

vi.mock('../axios', () => ({
  axiosInstance: vi.fn(),
}));

describe('axiosBaseQuery', () => {
  it('should return data on successful request', async () => {
    const mockData = { id: 1, name: 'John Doe' };
    (axiosInstance as any).mockResolvedValueOnce({ data: mockData });

    const baseQuery = axiosBaseQuery();
    const result = await baseQuery({ url: '/test', method: 'GET' }, {} as any, {} as any);

    expect(result).toEqual({ data: mockData });
    expect(axiosInstance).toHaveBeenCalledWith({ url: '/test', method: 'GET' });
  });

  it('should map RTK Query body to Axios data property', async () => {
    const mockData = { id: 1 };
    (axiosInstance as any).mockResolvedValueOnce({ data: mockData });

    const baseQuery = axiosBaseQuery();
    await baseQuery({ url: '/test', method: 'POST', body: { name: 'John' } }, {} as any, {} as any);

    expect(axiosInstance).toHaveBeenCalledWith({ url: '/test', method: 'POST', body: { name: 'John' }, data: { name: 'John' } });
  });

  it('should handle Axios errors and normalize them', async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
      message: 'Request failed',
    };
    (axiosInstance as any).mockRejectedValueOnce(mockError);

    const baseQuery = axiosBaseQuery();
    const result = await baseQuery({ url: '/test', method: 'GET' }, {} as any, {} as any);

    expect(result).toEqual({
      error: {
        status: 404,
        data: { message: 'Not found' },
      },
    });
  });
});
