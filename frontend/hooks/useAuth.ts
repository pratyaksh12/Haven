import { AuthService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuth() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState("");
    const router = useRouter();



    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError("");

        try {
            await AuthService.login(username, password);
            router.push('/vault');
        } catch (err) {
            console.error(err);
            setError("Login failed. Check console");
        } finally {
            setIsLoading(false);
        }
    }
    return { login, isLoading, error };
}