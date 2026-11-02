import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const branchApi = {
  getAll: () => api.get('/branches'),
  getOne: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
};

export const roomApi = {
  getAll: (params) => api.get('/rooms', { params }),
  getOne: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export const studentApi = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const rentApi = {
  getMy: () => api.get('/rent/my'),
  getAll: (params) => api.get('/rent', { params }),
  create: (data) => api.post('/rent', data),
  delete: (id) => api.delete(`/rent/${id}`),
  generate: (data) => api.post('/rent/generate', data),
  initiatePayment: (id) => api.post(`/rent/${id}/initiate-payment`),
  confirmPayment: (id, data) => api.post(`/rent/${id}/confirm-payment`, data),
  updateStatus: (id, data) => api.patch(`/rent/${id}/status`, data),
};

export const electricityApi = {
  getMy: () => api.get('/electricity/my'),
  getAll: (params) => api.get('/electricity', { params }),
  create: (data) => api.post('/electricity', data),
  initiatePayment: (id) => api.post(`/electricity/${id}/initiate-payment`),
  confirmPayment: (id, data) => api.post(`/electricity/${id}/confirm-payment`, data),
  delete: (id) => api.delete(`/electricity/${id}`),
};

export const pollApi = {
  getToday: (params) => api.get('/poll/today', { params }),
  vote: (data) => api.post('/poll/vote', data),
  getSummary: (params) => api.get('/poll/summary', { params }),
  create: (data) => api.post('/poll', data),
  delete: (id) => api.delete(`/poll/${id}`),
};

export const announcementApi = {
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const menuApi = {
  getToday: (params) => api.get('/menu', { params }),
  getWeek: (params) => api.get('/menu/week', { params }),
  upsert: (data) => api.post('/menu', data),
  delete: (id) => api.delete(`/menu/${id}`),
};

export const canteenOrderApi = {
  placeOrder: (data) => api.post('/canteen-orders', data),
  getMyOrders: () => api.get('/canteen-orders/my'),
  getAllOrders: (params) => api.get('/canteen-orders', { params }),
  updateStatus: (id, data) => api.patch(`/canteen-orders/${id}/status`, data),
};

export const ticketApi = {
  createTicket: (data) => api.post('/tickets', data),
  getMyTickets: () => api.get('/tickets/my'),
  getAllTickets: (params) => api.get('/tickets', { params }),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data),
};

export const enquiryApi = {
  create: (data) => api.post('/enquiries', data),
  getAll: (params) => api.get('/enquiries', { params }),
  updateStatus: (id, data) => api.patch(`/enquiries/${id}`, data),
};

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  student: () => api.get('/dashboard/student'),
};

export const contactApi = {
  get: () => api.get('/contact'),
  update: (data) => api.put('/contact', data),
};
