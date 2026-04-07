-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlannerWarehouse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sqFt" REAL NOT NULL,
    "floorStrengthPsf" REAL NOT NULL,
    "roofHeightFt" REAL NOT NULL,
    "loadFactor" REAL NOT NULL DEFAULT 0.8,
    "bufferPct" REAL NOT NULL DEFAULT 0.1,
    "clearanceUnderRoofFt" REAL NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlannerWarehouse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlannerCargoLot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "warehouseId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sqFt" REAL NOT NULL,
    "weightLbs" REAL NOT NULL,
    "stackHeightFt" REAL NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlannerCargoLot_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "PlannerWarehouse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehouseZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "portLocode" TEXT NOT NULL DEFAULT 'USMOB',
    "kind" TEXT NOT NULL,
    "totalSqFt" REAL NOT NULL,
    "bufferPct" REAL NOT NULL DEFAULT 0.12,
    "movesPerDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "customerRef" TEXT NOT NULL,
    "laneRef" TEXT,
    "title" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Reservation_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WarehouseZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForecastLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerRef" TEXT NOT NULL,
    "laneRef" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "expectedQty" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SpotRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT,
    "requesterRef" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "allowPreemptLowPriority" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpotRequest_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WarehouseZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanningEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PlannerWarehouse_userId_idx" ON "PlannerWarehouse"("userId");

-- CreateIndex
CREATE INDEX "PlannerCargoLot_warehouseId_startAt_endAt_idx" ON "PlannerCargoLot"("warehouseId", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "Reservation_zoneId_startsAt_endsAt_idx" ON "Reservation"("zoneId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "ForecastLine_periodStart_periodEnd_idx" ON "ForecastLine"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "SpotRequest_status_windowStart_idx" ON "SpotRequest"("status", "windowStart");

-- CreateIndex
CREATE INDEX "PlanningEvent_createdAt_idx" ON "PlanningEvent"("createdAt");
