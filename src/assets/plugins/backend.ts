import axios, { type AxiosInstance } from 'axios';

export const backend: AxiosInstance = axios.create({
    baseURL: "http://localhost:45000"
});