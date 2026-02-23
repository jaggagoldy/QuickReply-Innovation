-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IdeaStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdeaStatusHistory_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IdeaStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_IdeaStatusHistory" ("changedBy", "comment", "createdAt", "id", "ideaId", "status") SELECT "changedBy", "comment", "createdAt", "id", "ideaId", "status" FROM "IdeaStatusHistory";
DROP TABLE "IdeaStatusHistory";
ALTER TABLE "new_IdeaStatusHistory" RENAME TO "IdeaStatusHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
