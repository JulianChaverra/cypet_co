-- CreateTable
CREATE TABLE "TechUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'game_client',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL DEFAULT 'Junior.sys',
    "dnaType" TEXT NOT NULL,
    "syncMeter" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "corruptionLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastEvolutionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEvolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechUser_username_key" ON "TechUser"("username");
