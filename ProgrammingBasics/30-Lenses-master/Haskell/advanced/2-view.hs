--
-- cabal install template-haskell
-- ghc 1-lens.hs 2-view.hs -o 2-view
-- ./2-view
--
{-# LANGUAGE Rank2Types #-}
{-# LANGUAGE TemplateHaskell #-}
import Data.Functor.Const (Const(..))
import Text.Printf (printf)

import Lens

view :: Lens s t a b -> s -> a
view l s = getConst $ l Const s

data City = City
  { _cityName :: String
  , _country :: String
  , _inEU :: Bool
  } deriving Show
$(makeLens ""City)

data Person = Person 
  { _name :: String
  , _city :: City
  , _born :: Int
  } deriving Show
$(makeLens ""Person)

person = Person "Marcus Aurelius" (City "Rome" "Italy" True) 121

main = printf "view country of the city person was born in: %v\n"
     $ view (city . country) person
