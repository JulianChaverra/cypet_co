"use client";

import dynamic from "next/dynamic";

const AppWithoutSSR = dynamic(() => import("@/App"), {
    ssr: false,
    loading: () => <p>Preparando el mundo...</p>,
});

export default function GameClient() {
    return <AppWithoutSSR />;
}
