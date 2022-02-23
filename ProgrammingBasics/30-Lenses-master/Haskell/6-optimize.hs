import Text.Printf
import Data.Char

data Person = Person
  { _name :: String
  , _city :: String
  , _born :: Int
  } deriving Show
person = Person "Marcus Aurelius" "Rome" 121

setter name person = person { _name = name }
nameLens = (_name, setter)
view = fst
set = snd
over (g, s) f obj = s (f . g $ obj) obj

upper = map toUpper
main = do
  printf "view name: %v\n" $ view nameLens person
  printf "set name: %v\n" $ show $ set nameLens "Marcus" person
  printf "over name: %v\n" $ show $ over nameLens upper person
