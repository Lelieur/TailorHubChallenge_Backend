/*                                                                                                                                                           
    Warnings:                                                                                                                                                  
                                                                                                                                                               
    - You are about to drop the `_FavoriteRestaurants` table. If the table is not empty, all the data it contains will be lost.                                
                                                                                                                                                               
  */                                                                                                                                                           
  -- DropForeignKey                                                                                                                                            
  ALTER TABLE "_FavoriteRestaurants" DROP CONSTRAINT "_FavoriteRestaurants_A_fkey";                                                                            
                                                                                                                                                               
  -- DropForeignKey                                                                                                                                            
  ALTER TABLE "_FavoriteRestaurants" DROP CONSTRAINT "_FavoriteRestaurants_B_fkey";                                                                            
                                                                                                                                                               
  -- AlterTable                                                                                                                                                
  ALTER TABLE "User" ADD COLUMN     "favoriteRestaurantIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];                                                           
                                                                                                                                                               
  -- Backfill favorites from join table                                                                                                                        
  UPDATE "User" u                                                                                                                                              
  SET "favoriteRestaurantIds" = sub.ids                                                                                                                        
  FROM (                                                                                                                                                       
    SELECT "B" AS user_id, array_agg("A") AS ids                                                                                                               
    FROM "_FavoriteRestaurants"                                                                                                                                
    GROUP BY "B"                                                                                                                                               
  ) sub                                                                                                                                                        
  WHERE u.id = sub.user_id;
                                                                                                                                                               
  -- DropTable                                                                                                                                                 
  DROP TABLE "_FavoriteRestaurants";   