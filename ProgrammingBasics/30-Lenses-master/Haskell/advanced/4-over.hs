--
-- cabal install template-haskell
-- ghc 1-lens.hs 4-over.hs -o 4-over
-- ./4-over
--
{-# LANGUAGE Rank2Types #-}
{-# LANGUAGE TemplateHaskell #-}

import Data.Char (toUpper)
import Data.Functor.Identity (Identity(..))
import Text.Printf (printf)

import Lens

over :: Lens" s a -> (a -> a) -> s -> s
over l ab s = runIdentity $ l (Identity . ab) s 

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

main = printf "over name of the city person was born in: %v\n"
     $ show $ over (city . cityName) (map toUpper) person
