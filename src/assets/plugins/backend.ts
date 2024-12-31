import axios, { type AxiosInstance } from 'axios';

export const backend: AxiosInstance = axios.create({
    baseURL: "http://192.168.0.3:45000"
});