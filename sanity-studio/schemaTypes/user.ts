export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    { name: 'supabaseId', title: 'Supabase ID', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'name', title: 'Name', type: 'string' },
  ],
};