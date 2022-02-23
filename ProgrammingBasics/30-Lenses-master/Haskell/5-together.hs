import Text.Printf
import Data.Char

data Person = Person
  { _name :: String
  , _city :: String
  , _born :: Int
  } deriving Show
person = Person "Marcus Aurelius" "Rome" 121

data Lens s a = Lens (s -> a) (a -> s -> s)
nameGetter = _name
nameSetter name person = person { _name = name }
nameLens = Lens nameGetter nameSetter
view (Lens g _) = g
set (Lens _ s) = s
over (Lens g s) f obj = s (f . g $ obj) obj

upper = map toUpper
main = do
  printf "view name: %v\n" $ view nameLens person
  printf "set name: %v\n" $ show $ set nameLens "Marcus" person
  printf "over name: %v\n" $ show $ over nameLens upper person
