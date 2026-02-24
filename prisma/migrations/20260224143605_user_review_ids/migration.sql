-- DropForeignKey                                                                                                                                            
  ALTER TABLE "Review" DROP CONSTRAINT "Review_authorId_fkey";                                                                                                 
                                                                                                                                                               
  -- AlterTable                                                                                                                                                
  ALTER TABLE "User" ADD COLUMN     "reviewIds" TEXT[] DEFAULT ARRAY[]::TEXT[];                                                                                
                                                                                                                                                               
  -- Backfill reviewIds from Review.authorId                                                                                                                   
  UPDATE "User" u                                                                                                                                              
  SET "reviewIds" = sub.ids                                                                                                                                    
  FROM (                                                                                                                                                       
    SELECT "authorId" AS user_id, array_agg("id") AS ids
    FROM "Review"                                                                                                                                              
    GROUP BY "authorId"                                                                                                                                        
  ) sub                                                                                                                                                        
  WHERE u.id = sub.user_id;       