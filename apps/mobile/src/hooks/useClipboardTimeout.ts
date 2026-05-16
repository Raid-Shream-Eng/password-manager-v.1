import { useCallback, useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";

type UseClipboardTimeoutOptions = {
    timeoutMs: number;
    onTimeout?: ()=> void;
};

export function useClipboardTimeout(options: UseClipboardTimeoutOptions){
    const { timeoutMs, onTimeout } = options;
    const [ isCopied, setIsCopied ] = useState(false);
    const [ remainingSeconds, setRemainingSeconds ] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>| null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval>| null>(null);
    const clearTimers = useCallback(()=>{
        if (timeoutRef.current){
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current){
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const clearClipboard = useCallback(async ()=> {
        try {
            await Clipboard.setStringAsync("");
        } finally {
            setIsCopied(false);
            setRemainingSeconds(null);
            clearTimers();
            onTimeout?.();
        }
    }, [clearTimers, onTimeout]);

    const copyWithTimeout = useCallback(
        async (value: string) => {
            await Clipboard.setStringAsync(value);

            clearTimers();
            setIsCopied(true);
            setRemainingSeconds(Math.ceil(timeoutMs / 1000));

            const startedAt = Date.now();

            intervalRef.current = setInterval(()=>{
                const elapsed = Date.now() - startedAt;
                const remaining = Math.max(
                    0,
                    Math.ceil((timeoutMs - elapsed) / 1000),
                );
                setRemainingSeconds(remaining);
            }, 1000);

            timeoutRef.current = setTimeout(() => {
                void clearClipboard();
            }, timeoutMs);
        }, [clearClipboard, clearTimers, timeoutMs],
    );

    useEffect(()=>{
        return ()=>{
            clearTimers();
        };
    },[clearTimers]);

    return {
        isCopied,
        remainingSeconds,
        copyWithTimeout,
        clearClipboard,
    };
}