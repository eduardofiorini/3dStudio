// Mock Supabase client for compatibility
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { value: 'mock-api-key' }, error: null })
      })
    })
  }),
  storage: {
    from: () => ({
      getPublicUrl: () => ({ data: { publicUrl: '' }, error: null })
    })
  }
};