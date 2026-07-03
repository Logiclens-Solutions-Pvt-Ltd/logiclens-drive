'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "./auth";


export function useRequireAuth(){
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect( () => {
        if(!isAuthenticated()){
            router.push('/login');
        } else{
            setChecked(true);
        }
    }, [router]);

    return checked;
}