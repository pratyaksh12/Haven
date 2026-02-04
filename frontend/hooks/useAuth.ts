import { AuthService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuth() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>();
    const router = useRouter();



    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            await AuthService.login(username, password);
            router.push('/vault');
            return true;
        } catch (err: any) {
            console.error(err);
            if (err.message === "Network Error" || !err.response) {
                setError("Network Error: Backend is down.");
            } else {
                setError(err.response?.data || "Login failed.");
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }
    const logout = () => {
        AuthService.logout();
        router.push('/login');
    };

    return { login, logout, isLoading, error };
}