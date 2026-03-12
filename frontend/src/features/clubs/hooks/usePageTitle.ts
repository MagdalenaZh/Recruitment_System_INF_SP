import { useEffect } from "react";

export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    const eventSource = new EventSource('https://localhost:7113/api/eventEmmitter/aplicationUpdates');

    eventSource.addEventListener('applicationUpdates', (event) => {
        const payload = JSON.parse(event.data);
        console.log(`New Order ${event.lastEventId}:`, payload.data);
    });
}
