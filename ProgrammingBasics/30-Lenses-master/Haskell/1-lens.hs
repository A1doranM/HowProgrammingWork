data Person = Person
  { _name :: String
  , _city :: String
  , _born :: Int
  } deriving Show

data Lens s a = Lens (s -> a) (a -> s -> s)
nameGetter = _name
nameSetter name person = person { _name = name }
nameLens = Lens nameGetter nameSetter
