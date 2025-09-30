import Text.Printf

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
set (Lens _ s) = s

main = printf "set name: %v\n" $ show $ set nameLens "Marcus" person
