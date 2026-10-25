import styles from "@/styles/Home.module.css";
import GameClient from "./GameClient.tsx";

export default function Home() {
    return (
        <main className={styles.main}>
            <GameClient />
        </main>
    );
}