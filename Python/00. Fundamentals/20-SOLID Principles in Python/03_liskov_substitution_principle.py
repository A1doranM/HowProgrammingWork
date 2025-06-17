"""
SOLID Principles in Python - Liskov Substitution Principle (LSP)

The Liskov Substitution Principle is the third principle of SOLID.
It states that objects of a superclass should be replaceable with objects of its subclasses
without breaking the application.

Definition: If S is a subtype of T, then objects of type T may be replaced with objects 
of type S without altering any of the desirable properties of the program.

Simply put: Derived classes must be substitutable for their base classes.

Why it matters:
- Ensures proper inheritance relationships
- Maintains behavioral contracts in polymorphism
- Prevents unexpected behavior when using subclasses
- Supports the Open/Closed Principle
- Makes code more reliable and predictable

When to apply:
- When designing inheritance hierarchies
- When creating subclasses that extend base functionality
- When using polymorphism in your code
- When you want to ensure behavioral consistency

Key Rules (Behavioral Subtyping):
1. Preconditions cannot be strengthened in subclasses
2. Postconditions cannot be weakened in subclasses  
3. Invariants must be preserved in subclasses
4. History constraint (new methods shouldn't allow state changes that base class doesn't allow)

Common Violations:
- Rectangle/Square problem
- Bird/Penguin (flightless birds) problem
- Changing method signatures inappropriately
- Throwing unexpected exceptions
- Returning incompatible types
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Protocol
import math


# ============================================================================
# BAD EXAMPLE 1 - Classic Rectangle/Square Problem (LSP Violation)
# ============================================================================

class RectangleBad:
    """
    BAD EXAMPLE: This will be violated by Square subclass.
    The Rectangle class establishes behavioral contracts that Square cannot maintain.
    """
    
    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height
    
    @property
    def width(self) -> float:
        return self._width
    
    @width.setter
    def width(self, value: float) -> None:
        self._width = value
    
    @property
    def height(self) -> float:
        return self._height
    
    @height.setter
    def height(self, value: float) -> None:
        self._height = value
    
    def get_area(self) -> float:
        return self._width * self._height
    
    def __str__(self) -> str:
        return f"Rectangle(width={self._width}, height={self._height})"


class SquareBad(RectangleBad):
    """
    BAD EXAMPLE: This violates LSP because it changes the behavior expected from Rectangle.
    
    Problems:
    1. Setting width changes height (unexpected side effect)
    2. Setting height changes width (unexpected side effect)
    3. Violates the behavioral contract of Rectangle
    4. Cannot be used as a drop-in replacement for Rectangle
    """
    
    def __init__(self, side: float):
        super().__init__(side, side)
    
    @property
    def width(self) -> float:
        return self._width
    
    @width.setter
    def width(self, value: float) -> None:
        # VIOLATION: Setting width also changes height - unexpected behavior!
        self._width = value
        self._height = value  # Side effect not expected by clients
    
    @property
    def height(self) -> float:
        return self._height
    
    @height.setter
    def height(self, value: float) -> None:
        # VIOLATION: Setting height also changes width - unexpected behavior!
        self._width = value  # Side effect not expected by clients
        self._height = value
    
    def __str__(self) -> str:
        return f"Square(side={self._width})"


def test_rectangle_behavior_bad(rectangle: RectangleBad) -> None:
    """
    This function expects Rectangle behavior, but Square violates these expectations.
    This demonstrates the LSP violation.
    """
    print(f"Testing: {rectangle}")
    print(f"Initial area: {rectangle.get_area()}")
    
    # This should only change the width, leaving height unchanged
    original_height = rectangle.height
    rectangle.width = 10
    
    print(f"After setting width to 10:")
    print(f"Width: {rectangle.width}, Height: {rectangle.height}")
    print(f"Area: {rectangle.get_area()}")
    
    # With a true Rectangle, height should remain unchanged
    # But with Square, height will change too - this violates LSP!
    if rectangle.height != original_height:
        print("❌ LSP VIOLATION: Height changed unexpectedly when width was set!")
    else:
        print("✅ Height remained unchanged as expected")


# ============================================================================
# BAD EXAMPLE 2 - Bird/Penguin Problem (LSP Violation)
# ============================================================================

class BirdBad:
    """
    BAD EXAMPLE: This base class assumes all birds can fly.
    This assumption will be violated by flightless birds.
    """
    
    def __init__(self, name: str):
        self.name = name
    
    def fly(self) -> str:
        """All birds should be able to fly according to this design."""
        return f"{self.name} is flying!"
    
    def make_sound(self) -> str:
        return f"{self.name} makes a sound"


class SparrowBad(BirdBad):
    """This works fine - sparrows can fly."""
    
    def fly(self) -> str:
        return f"{self.name} the sparrow soars through the sky!"
    
    def make_sound(self) -> str:
        return f"{self.name} chirps melodiously"


class PenguinBad(BirdBad):
    """
    BAD EXAMPLE: This violates LSP because penguins cannot fly.
    
    Problems:
    1. Throws exception when fly() is called - unexpected behavior
    2. Cannot be used as drop-in replacement for Bird  
    3. Violates the behavioral contract established by Bird
    4. Code expecting Bird behavior will break with Penguin
    """
    
    def fly(self) -> str:
        # VIOLATION: Throwing exception violates the behavioral contract!
        raise NotImplementedError("Penguins cannot fly!")
    
    def make_sound(self) -> str:
        return f"{self.name} makes penguin sounds"


def make_birds_fly_bad(birds: List[BirdBad]) -> None:
    """
    This function expects all birds to be able to fly.
    It will break when given a Penguin due to LSP violation.
    """
    for bird in birds:
        try:
            print(bird.fly())
        except NotImplementedError as e:
            print(f"❌ LSP VIOLATION: {e}")


# ============================================================================
# BAD EXAMPLE 3 - File Handler Problem (LSP Violation)
# ============================================================================

class FileHandlerBad:
    """
    BAD EXAMPLE: Base class that establishes contracts for file operations.
    """
    
    def __init__(self, filename: str):
        self.filename = filename
    
    def read(self) -> str:
        """Read content from file."""
        return f"Reading from {self.filename}"
    
    def write(self, content: str) -> str:
        """Write content to file."""
        return f"Writing '{content}' to {self.filename}"
    
    def delete(self) -> str:
        """Delete the file."""
        return f"Deleting {self.filename}"


class ReadOnlyFileHandlerBad(FileHandlerBad):
    """
    BAD EXAMPLE: This violates LSP by restricting operations.
    
    Problems:
    1. Throws exceptions for write and delete operations
    2. Cannot be used as drop-in replacement for FileHandler
    3. Violates behavioral contract of base class
    4. Strengthens preconditions (requires read-only access)
    """
    
    def write(self, content: str) -> str:
        # VIOLATION: Throwing exception violates the behavioral contract!
        raise PermissionError("Cannot write to read-only file!")
    
    def delete(self) -> str:
        # VIOLATION: Throwing exception violates the behavioral contract!
        raise PermissionError("Cannot delete read-only file!")


# ============================================================================
# GOOD EXAMPLE 1 - Proper Shape Hierarchy (Following LSP)
# ============================================================================

class Shape(ABC):
    """
    GOOD: Abstract base class that defines contracts all shapes must follow.
    No assumptions about specific behaviors that some shapes cannot fulfill.
    """
    
    @abstractmethod
    def get_area(self) -> float:
        """Calculate the area of the shape."""
        pass
    
    @abstractmethod
    def get_perimeter(self) -> float:
        """Calculate the perimeter of the shape."""
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Get a description of the shape."""
        pass
    
    def __str__(self) -> str:
        return f"{self.get_description()} (Area: {self.get_area():.2f}, Perimeter: {self.get_perimeter():.2f})"


class Rectangle(Shape):
    """GOOD: Rectangle implementation that follows LSP."""
    
    def __init__(self, width: float, height: float):
        if width <= 0 or height <= 0:
            raise ValueError("Width and height must be positive")
        self._width = width
        self._height = height
    
    @property
    def width(self) -> float:
        return self._width
    
    @property
    def height(self) -> float:
        return self._height
    
    def get_area(self) -> float:
        return self._width * self._height
    
    def get_perimeter(self) -> float:
        return 2 * (self._width + self._height)
    
    def get_description(self) -> str:
        return f"Rectangle({self._width}x{self._height})"
    
    def resize(self, new_width: float, new_height: float) -> 'Rectangle':
        """Return a new rectangle with different dimensions."""
        return Rectangle(new_width, new_height)


class Square(Shape):
    """
    GOOD: Square as a separate shape, not inheriting from Rectangle.
    This avoids the Rectangle/Square LSP violation.
    """
    
    def __init__(self, side: float):
        if side <= 0:
            raise ValueError("Side must be positive")
        self._side = side
    
    @property
    def side(self) -> float:
        return self._side
    
    def get_area(self) -> float:
        return self._side * self._side
    
    def get_perimeter(self) -> float:
        return 4 * self._side
    
    def get_description(self) -> str:
        return f"Square(side={self._side})"
    
    def resize(self, new_side: float) -> 'Square':
        """Return a new square with different side length."""
        return Square(new_side)


class Circle(Shape):
    """GOOD: Circle implementation that follows LSP."""
    
    def __init__(self, radius: float):
        if radius <= 0:
            raise ValueError("Radius must be positive")
        self._radius = radius
    
    @property
    def radius(self) -> float:
        return self._radius
    
    def get_area(self) -> float:
        return math.pi * self._radius * self._radius
    
    def get_perimeter(self) -> float:
        return 2 * math.pi * self._radius
    
    def get_description(self) -> str:
        return f"Circle(radius={self._radius})"
    
    def resize(self, new_radius: float) -> 'Circle':
        """Return a new circle with different radius."""
        return Circle(new_radius)


def test_shapes_lsp(shapes: List[Shape]) -> None:
    """
    This function can work with any Shape implementation without issues.
    All shapes follow LSP and can be used interchangeably.
    """
    print("Testing shapes (all follow LSP):")
    total_area = 0
    total_perimeter = 0
    
    for shape in shapes:
        area = shape.get_area()
        perimeter = shape.get_perimeter()
        total_area += area
        total_perimeter += perimeter
        print(f"  {shape}")
    
    print(f"Total area: {total_area:.2f}")
    print(f"Total perimeter: {total_perimeter:.2f}")


# ============================================================================
# GOOD EXAMPLE 2 - Proper Bird Hierarchy (Following LSP)
# ============================================================================

class Bird(ABC):
    """
    GOOD: Abstract base class that only defines behaviors ALL birds share.
    No assumptions about flight capabilities.
    """
    
    def __init__(self, name: str, species: str):
        self.name = name
        self.species = species
    
    @abstractmethod
    def make_sound(self) -> str:
        """All birds make some kind of sound."""
        pass
    
    @abstractmethod
    def get_diet(self) -> str:
        """Get information about the bird's diet."""
        pass
    
    def get_info(self) -> str:
        """Get basic information about the bird."""
        return f"{self.name} is a {self.species}"


class FlyingBird(Bird):
    """
    GOOD: Separate class for birds that can fly.
    This maintains LSP by only including flight behavior for birds that can actually fly.
    """
    
    @abstractmethod
    def fly(self) -> str:
        """Only flying birds have this method."""
        pass
    
    @abstractmethod
    def get_flight_speed(self) -> float:
        """Get the bird's flight speed in km/h."""
        pass


class FlightlessBird(Bird):
    """
    GOOD: Separate class for birds that cannot fly.
    This avoids LSP violations by not promising flight capabilities.
    """
    
    @abstractmethod
    def get_ground_speed(self) -> float:
        """Get the bird's ground movement speed in km/h."""
        pass


class Sparrow(FlyingBird):
    """GOOD: Sparrow is a flying bird."""
    
    def make_sound(self) -> str:
        return f"{self.name} chirps melodiously"
    
    def get_diet(self) -> str:
        return "Seeds, insects, and small fruits"
    
    def fly(self) -> str:
        return f"{self.name} the sparrow soars gracefully through the sky"
    
    def get_flight_speed(self) -> float:
        return 24.0  # km/h


class Eagle(FlyingBird):
    """GOOD: Eagle is a flying bird."""
    
    def make_sound(self) -> str:
        return f"{self.name} screeches powerfully"
    
    def get_diet(self) -> str:
        return "Fish, small mammals, and other birds"
    
    def fly(self) -> str:
        return f"{self.name} the eagle soars majestically at great heights"
    
    def get_flight_speed(self) -> float:
        return 120.0  # km/h


class Penguin(FlightlessBird):
    """GOOD: Penguin is explicitly a flightless bird."""
    
    def make_sound(self) -> str:
        return f"{self.name} makes adorable penguin sounds"
    
    def get_diet(self) -> str:
        return "Fish, krill, and squid"
    
    def get_ground_speed(self) -> float:
        return 8.0  # km/h on land
    
    def swim(self) -> str:
        """Penguins have their own special ability."""
        return f"{self.name} swims gracefully underwater at 35 km/h"


class Ostrich(FlightlessBird):
    """GOOD: Ostrich is explicitly a flightless bird."""
    
    def make_sound(self) -> str:
        return f"{self.name} makes deep booming sounds"
    
    def get_diet(self) -> str:
        return "Plants, seeds, and small animals"
    
    def get_ground_speed(self) -> float:
        return 70.0  # km/h - very fast runner!


def test_flying_birds(birds: List[FlyingBird]) -> None:
    """
    This function only works with flying birds.
    LSP is maintained because all FlyingBird subclasses can actually fly.
    """
    print("Testing flying birds:")
    for bird in birds:
        print(f"  {bird.get_info()}: {bird.fly()}")
        print(f"    Speed: {bird.get_flight_speed()} km/h")


def test_all_birds(birds: List[Bird]) -> None:
    """
    This function works with ALL birds because it only uses behaviors
    that ALL birds support (following LSP).
    """
    print("Testing all birds:")
    for bird in birds:
        print(f"  {bird.get_info()}")
        print(f"    Sound: {bird.make_sound()}")
        print(f"    Diet: {bird.get_diet()}")
        
        # Use isinstance to check specific capabilities without violating LSP
        if isinstance(bird, FlyingBird):
            print(f"    Flight: {bird.fly()}")
        elif isinstance(bird, FlightlessBird):
            print(f"    Ground speed: {bird.get_ground_speed()} km/h")
            if hasattr(bird, 'swim'):
                print(f"    Swimming: {bird.swim()}")


# ============================================================================
# GOOD EXAMPLE 3 - Proper File Handler Hierarchy (Following LSP)
# ============================================================================

class FileReader(ABC):
    """
    GOOD: Separate interface for file reading operations.
    No write/delete promises that some implementations cannot fulfill.
    """
    
    @abstractmethod
    def read(self) -> str:
        """Read content from file."""
        pass
    
    @abstractmethod
    def get_filename(self) -> str:
        """Get the filename."""
        pass


class FileWriter(ABC):
    """
    GOOD: Separate interface for file writing operations.
    Only implemented by classes that can actually write.
    """
    
    @abstractmethod
    def write(self, content: str) -> str:
        """Write content to file."""
        pass


class FileDeleter(ABC):
    """
    GOOD: Separate interface for file deletion operations.
    Only implemented by classes that can actually delete.
    """
    
    @abstractmethod
    def delete(self) -> str:
        """Delete the file."""
        pass


class FullAccessFileHandler(FileReader, FileWriter, FileDeleter):
    """
    GOOD: Handler that implements all operations because it can actually perform them.
    """
    
    def __init__(self, filename: str):
        self.filename = filename
    
    def read(self) -> str:
        return f"Reading from {self.filename}"
    
    def write(self, content: str) -> str:
        return f"Writing '{content}' to {self.filename}"
    
    def delete(self) -> str:
        return f"Deleting {self.filename}"
    
    def get_filename(self) -> str:
        return self.filename


class ReadOnlyFileHandler(FileReader):
    """
    GOOD: Only implements reading because that's all it can do.
    No false promises about write/delete capabilities.
    """
    
    def __init__(self, filename: str):
        self.filename = filename
    
    def read(self) -> str:
        return f"Reading from read-only file {self.filename}"
    
    def get_filename(self) -> str:
        return self.filename


def process_readable_files(readers: List[FileReader]) -> None:
    """
    This function works with any FileReader implementation.
    LSP is maintained because all implementations can actually read.
    """
    print("Processing readable files:")
    for reader in readers:
        print(f"  {reader.read()}")


def process_writable_files(writers: List[FileWriter]) -> None:
    """
    This function works with any FileWriter implementation.
    LSP is maintained because all implementations can actually write.
    """
    print("Processing writable files:")
    for writer in writers:
        print(f"  {writer.write('test content')}")


# ============================================================================
# DEMONSTRATION CODE
# ============================================================================

def demonstrate_lsp_violation():
    """Demonstrate the problems with violating LSP."""
    print("=" * 60)
    print("DEMONSTRATING LSP VIOLATION (BAD EXAMPLES)")
    print("=" * 60)
    
    # Rectangle/Square problem
    print("1. RECTANGLE/SQUARE PROBLEM:")
    print("-" * 30)
    
    rectangle = RectangleBad(5, 3)
    square = SquareBad(4)
    
    print("Testing with Rectangle:")
    test_rectangle_behavior_bad(rectangle)
    print()
    
    print("Testing with Square (violates LSP):")
    test_rectangle_behavior_bad(square)
    print()
    
    # Bird/Penguin problem
    print("2. BIRD/PENGUIN PROBLEM:")
    print("-" * 30)
    
    birds = [
        SparrowBad("Tweety"),
        PenguinBad("Pingu")
    ]
    
    make_birds_fly_bad(birds)
    print()
    
    # File handler problem
    print("3. FILE HANDLER PROBLEM:")
    print("-" * 30)
    
    handlers = [
        FileHandlerBad("document.txt"),
        ReadOnlyFileHandlerBad("readme.txt")
    ]
    
    for handler in handlers:
        print(f"Handler: {handler.filename}")
        print(f"  {handler.read()}")
        try:
            print(f"  {handler.write('test')}")
        except PermissionError as e:
            print(f"  ❌ LSP VIOLATION: {e}")
        print()


def demonstrate_lsp_compliance():
    """Demonstrate the benefits of following LSP."""
    print("=" * 60)
    print("DEMONSTRATING LSP COMPLIANCE (GOOD EXAMPLES)")
    print("=" * 60)
    
    # Proper shape hierarchy
    print("1. PROPER SHAPE HIERARCHY:")
    print("-" * 30)
    
    shapes = [
        Rectangle(5, 3),
        Square(4),
        Circle(2.5)
    ]
    
    test_shapes_lsp(shapes)
    print()
    
    # Proper bird hierarchy
    print("2. PROPER BIRD HIERARCHY:")
    print("-" * 30)
    
    all_birds = [
        Sparrow("Tweety", "House Sparrow"),
        Eagle("Majestic", "Bald Eagle"),
        Penguin("Pingu", "Emperor Penguin"),
        Ostrich("Speedy", "Common Ostrich")
    ]
    
    flying_birds = [bird for bird in all_birds if isinstance(bird, FlyingBird)]
    
    test_flying_birds(flying_birds)
    print()
    
    test_all_birds(all_birds)
    print()
    
    # Proper file handler hierarchy
    print("3. PROPER FILE HANDLER HIERARCHY:")
    print("-" * 30)
    
    readers = [
        FullAccessFileHandler("document.txt"),
        ReadOnlyFileHandler("readme.txt")
    ]
    
    writers = [
        FullAccessFileHandler("document.txt")
        # ReadOnlyFileHandler is not included because it can't write
    ]
    
    process_readable_files(readers)
    print()
    
    process_writable_files(writers)
    print()


def demonstrate_substitutability():
    """Demonstrate how LSP enables proper substitutability."""
    print("=" * 60)
    print("DEMONSTRATING SUBSTITUTABILITY")
    print("=" * 60)
    
    def calculate_total_area(shapes: List[Shape]) -> float:
        """
        This function works with ANY Shape subclass because they all
        properly implement the Shape contract (following LSP).
        """
        return sum(shape.get_area() for shape in shapes)
    
    # All these shapes can be used interchangeably
    shape_sets = [
        [Rectangle(5, 3), Rectangle(2, 4)],
        [Square(4), Square(6)],
        [Circle(2), Circle(3)],
        [Rectangle(5, 3), Square(4), Circle(2)]  # Mixed types!
    ]
    
    for i, shapes in enumerate(shape_sets, 1):
        print(f"Set {i}: {[shape.get_description() for shape in shapes]}")
        total_area = calculate_total_area(shapes)
        print(f"Total area: {total_area:.2f}")
        print()
    
    print("✅ All shape types work correctly because they follow LSP!")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("SOLID Principles in Python - Liskov Substitution Principle")
    print("==========================================================")
    print()
    
    demonstrate_lsp_violation()
    print()
    
    demonstrate_lsp_compliance()
    print()
    
    demonstrate_substitutability()
    
    print("=" * 60)
    print("KEY TAKEAWAYS:")
    print("=" * 60)
    print("1. Subclasses must be substitutable for their base classes")
    print("2. Don't strengthen preconditions or weaken postconditions in subclasses")
    print("3. Maintain behavioral contracts established by base classes")
    print("4. Don't throw unexpected exceptions in subclasses")
    print("5. Use composition over inheritance when LSP would be violated")
    print("6. Design base classes to only include behaviors ALL subclasses can fulfill")
    print("7. Consider using separate interfaces for different capabilities")
    print("8. LSP violations often indicate poor inheritance design")
    print("9. 'Is-a' relationship should be behavioral, not just structural")
    print("10. When in doubt, favor composition and interfaces over inheritance")
