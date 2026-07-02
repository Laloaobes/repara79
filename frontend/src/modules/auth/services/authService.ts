import apiClient from '../../../api/axios';

export async function login(email: string, password: string) {
const response = await apiClient.post('/login', {
email,
password
});

return response.data;

}

export async function register(name: string, email: string, password: string, passwordConfirmation: string) {
const response = await apiClient.post('/register', {
name,
email,
password,
password_confirmation: passwordConfirmation
});

return response.data;

}

export async function logout() {
const response = await apiClient.post('/logout');

return response.data;

}

export async function me() {
const response = await apiClient.get('/me');

return response.data;

}
