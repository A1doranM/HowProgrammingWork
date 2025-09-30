--
-- cabal install template-haskell
-- ghc 1-lens.hs 5-together.hs -o 5-together
-- ./5-together
--
{-# LANGUAGE Rank2Types #-}
{-# LANGUAGE TemplateHaskell #-}

import Data.Char (toUpper)
import Data.Functor.Const (Const(..))
import Data.Functor.Identity (Identity(..))
import Text.Printf (printf)

import Lens

view :: Lens s t a b -> s -> a
view l s = getConst $ l Const s

set :: Lens" s a -> a -> s -> s
set l a s = runIdentity $ l (Identity . const a) s

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


main = do
  printf "view country of the city person was born in: %v\n"
     $ view (city . country) person
  printf "set inEU of the city person was born in: %v\n"
     $ show $ set (city . inEU) False person
  printf "over name of the city person was born in: %v\n"
     $ show $ over (city . cityName) (map toUpper) person
