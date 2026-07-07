-- CreateTable
CREATE TABLE "GoogleOAuthToken" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiryDate" TIMESTAMP(3),
    "scope" TEXT,
    "tokenType" TEXT,
    "accountEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleOAuthToken_pkey" PRIMARY KEY ("id")
);
