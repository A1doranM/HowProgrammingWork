--
-- cabal install template-haskell
-- ghc 1-lens.hs 3-set.hs -o 3-set
-- ./3-set
--
{-# LANGUAGE Rank2Types #-}
{-# LANGUAGE TemplateHaskell #-}
import Data.Functor.Identity (Identity(..))
import Text.Printf (printf)

import Lens

set :: Lens" s a -> a -> s -> s
set l a s = runIdentity $ l (Identity . const a) s 

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

main = printf "set inEU of the city person was born in: %v\n"
     $ show $ set (city . inEU) False person
