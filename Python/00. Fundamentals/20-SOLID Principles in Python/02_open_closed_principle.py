"""
SOLID Principles in Python - Open/Closed Principle (OCP)

The Open/Closed Principle is the second principle of SOLID.
It states that software entities should be OPEN for extension but CLOSED for modification.

Definition: You should be able to add new functionality without changing existing code.

Why it matters:
- Reduces risk of breaking existing functionality when adding features
- Promotes code stability and reliability
- Encourages good design patterns (inheritance, composition, polymorphism)
- Makes code more maintainable and scalable
- Follows the "Don't touch working code" philosophy

When to apply:
- When you need to add new functionality frequently
- When you want to avoid modifying stable, tested code
- When designing systems that need to be extensible
- When multiple developers work on the same codebase

How to achieve:
- Use inheritance and polymorphism
- Use composition and strategy pattern
- Use abstract base classes or protocols
- Use dependency injection
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Protocol
from enum import Enum
import math


# ============================================================================
# BAD EXAMPLE - Violating Open/Closed Principle
# ============================================================================

class ShapeType(Enum):
    """Enumeration for different shape types."""
    RECTANGLE = "rectangle"
    CIRCLE = "circle"
    TRIANGLE = "triangle"


class AreaCalculatorBad:
    """
    BAD EXAMPLE: This class violates OCP because every time we want to add
    a new shape, we need to MODIFY the existing calculate_area method.
    
    Problems:
    1. Must modify existing code to add new shapes
    2. Risk of breaking existing functionality
    3. Violates the Open/Closed Principle
    4. Code becomes harder to maintain as it grows
    """
    
    def calculate_area(self, shape_type: ShapeType, **kwargs) -> float:
        """Calculate area based on shape type - BAD APPROACH."""
        if shape_type == ShapeType.RECTANGLE:
            width = kwargs.get('width', 0)
            height = kwargs.get('height', 0)
            return width * height
        
        elif shape_type == ShapeType.CIRCLE:
            radius = kwargs.get('radius', 0)
            return math.pi * radius * radius
        
        elif shape_type == ShapeType.TRIANGLE:
            base = kwargs.get('base', 0)
            height = kwargs.get('height', 0)
            return 0.5 * base * height
        
        # Every time we add a new shape, we need to modify this method!
        # This violates the Open/Closed Principle
        else:
            raise ValueError(f"Unsupported shape type: {shape_type}")


class ReportGeneratorBad:
    """
    BAD EXAMPLE: This class violates OCP because adding new report formats
    requires modifying the existing generate_report method.
    """
    
    def generate_report(self, data: List[Dict], format_type: str) -> str:
        """Generate report in different formats - BAD APPROACH."""
        if format_type == "text":
            result = "TEXT REPORT\n"
            result += "=" * 20 + "\n"
            for item in data:
                result += f"- {item}\n"
            return result
        
        elif format_type == "html":
            result = "<html><body><h1>HTML REPORT</h1><ul>"
            for item in data:
                result += f"<li>{item}</li>"
            result += "</ul></body></html>"
            return result
        
        elif format_type == "json":
            import json
            return json.dumps({"report": data}, indent=2)
        
        # Adding XML, PDF, CSV formats would require modifying this method!
        else:
            raise ValueError(f"Unsupported format: {format_type}")


class DiscountCalculatorBad:
    """
    BAD EXAMPLE: This class violates OCP because adding new discount types
    requires modifying the calculate_discount method.
    """
    
    def calculate_discount(self, amount: float, customer_type: str, **kwargs) -> float:
        """Calculate discount based on customer type - BAD APPROACH."""
        if customer_type == "regular":
            return 0  # No discount for regular customers
        
        elif customer_type == "premium":
            return amount * 0.1  # 10% discount
        
        elif customer_type == "vip":
            return amount * 0.2  # 20% discount
        
        elif customer_type == "employee":
            return amount * 0.5  # 50% discount
        
        elif customer_type == "seasonal":
            # Seasonal discount might depend on current month
            import datetime
            current_month = datetime.datetime.now().month
            if current_month in [11, 12]:  # November, December
                return amount * 0.15  # 15% holiday discount
            return 0
        
        # Adding new customer types requires modifying this method!
        else:
            raise ValueError(f"Unknown customer type: {customer_type}")


# ============================================================================
# GOOD EXAMPLE - Following Open/Closed Principle
# ============================================================================

class Shape(ABC):
    """
    GOOD: Abstract base class for all shapes.
    This allows us to add new shapes without modifying existing code.
    """
    
    @abstractmethod
    def calculate_area(self) -> float:
        """Calculate the area of the shape."""
        pass
    
    @abstractmethod
    def get_name(self) -> str:
        """Get the name of the shape."""
        pass
    
    def __str__(self) -> str:
        return f"{self.get_name()} (Area: {self.calculate_area():.2f})"


class Rectangle(Shape):
    """Rectangle implementation - follows OCP."""
    
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height
    
    def calculate_area(self) -> float:
        return self.width * self.height
    
    def get_name(self) -> str:
        return f"Rectangle({self.width}x{self.height})"


class Circle(Shape):
    """Circle implementation - follows OCP."""
    
    def __init__(self, radius: float):
        self.radius = radius
    
    def calculate_area(self) -> float:
        return math.pi * self.radius * self.radius
    
    def get_name(self) -> str:
        return f"Circle(r={self.radius})"


class Triangle(Shape):
    """Triangle implementation - follows OCP."""
    
    def __init__(self, base: float, height: float):
        self.base = base
        self.height = height
    
    def calculate_area(self) -> float:
        return 0.5 * self.base * self.height
    
    def get_name(self) -> str:
        return f"Triangle(b={self.base}, h={self.height})"


# New shapes can be added without modifying existing code!
class Square(Shape):
    """Square implementation - extends without modification."""
    
    def __init__(self, side: float):
        self.side = side
    
    def calculate_area(self) -> float:
        return self.side * self.side
    
    def get_name(self) -> str:
        return f"Square(s={self.side})"


class Ellipse(Shape):
    """Ellipse implementation - extends without modification."""
    
    def __init__(self, semi_major: float, semi_minor: float):
        self.semi_major = semi_major
        self.semi_minor = semi_minor
    
    def calculate_area(self) -> float:
        return math.pi * self.semi_major * self.semi_minor
    
    def get_name(self) -> str:
        return f"Ellipse(a={self.semi_major}, b={self.semi_minor})"


class AreaCalculatorGood:
    """
    GOOD: This calculator is CLOSED for modification but OPEN for extension.
    New shapes can be added without changing this class.
    """
    
    def calculate_area(self, shape: Shape) -> float:
        """Calculate area of any shape - follows OCP."""
        return shape.calculate_area()
    
    def calculate_total_area(self, shapes: List[Shape]) -> float:
        """Calculate total area of multiple shapes."""
        return sum(shape.calculate_area() for shape in shapes)
    
    def get_shape_report(self, shapes: List[Shape]) -> str:
        """Generate a report of all shapes and their areas."""
        report = "SHAPE AREA REPORT\n"
        report += "=" * 30 + "\n"
        total_area = 0
        
        for i, shape in enumerate(shapes, 1):
            area = shape.calculate_area()
            total_area += area
            report += f"{i}. {shape.get_name()}: {area:.2f}\n"
        
        report += "-" * 30 + "\n"
        report += f"Total Area: {total_area:.2f}\n"
        return report


# ============================================================================
# REPORT GENERATOR - Following OCP with Strategy Pattern
# ============================================================================

class ReportFormatter(Protocol):
    """
    Protocol (interface) for report formatters.
    This allows new formats to be added without modifying existing code.
    """
    
    def format(self, data: List[Dict[str, Any]]) -> str:
        """Format the data into a specific format."""
        ...


class TextFormatter:
    """Text format implementation."""
    
    def format(self, data: List[Dict[str, Any]]) -> str:
        result = "TEXT REPORT\n"
        result += "=" * 20 + "\n"
        for item in data:
            result += f"- {item}\n"
        return result


class HTMLFormatter:
    """HTML format implementation."""
    
    def format(self, data: List[Dict[str, Any]]) -> str:
        result = "<html><body><h1>HTML REPORT</h1><ul>"
        for item in data:
            result += f"<li>{item}</li>"
        result += "</ul></body></html>"
        return result


class JSONFormatter:
    """JSON format implementation."""
    
    def format(self, data: List[Dict[str, Any]]) -> str:
        import json
        return json.dumps({"report": data}, indent=2)


# New formatters can be added without modifying existing code!
class XMLFormatter:
    """XML format implementation - extends without modification."""
    
    def format(self, data: List[Dict[str, Any]]) -> str:
        result = '<?xml version="1.0"?>\n<report>\n'
        for item in data:
            result += f'  <item>{item}</item>\n'
        result += '</report>'
        return result


class CSVFormatter:
    """CSV format implementation - extends without modification."""
    
    def format(self, data: List[Dict[str, Any]]) -> str:
        if not data:
            return ""
        
        # Assume all items have the same keys
        first_item = data[0]
        if isinstance(first_item, dict):
            headers = ",".join(first_item.keys())
            rows = []
            for item in data:
                row = ",".join(str(v) for v in item.values())
                rows.append(row)
            return headers + "\n" + "\n".join(rows)
        else:
            return "\n".join(str(item) for item in data)


class ReportGeneratorGood:
    """
    GOOD: This generator is CLOSED for modification but OPEN for extension.
    New formats can be added without changing this class.
    """
    
    def __init__(self):
        self._formatters: Dict[str, ReportFormatter] = {}
    
    def register_formatter(self, format_name: str, formatter: ReportFormatter) -> None:
        """Register a new formatter - allows extension without modification."""
        self._formatters[format_name] = formatter
    
    def generate_report(self, data: List[Dict[str, Any]], format_name: str) -> str:
        """Generate report using the specified formatter."""
        if format_name not in self._formatters:
            raise ValueError(f"Unknown format: {format_name}")
        
        formatter = self._formatters[format_name]
        return formatter.format(data)
    
    def get_available_formats(self) -> List[str]:
        """Get list of available formats."""
        return list(self._formatters.keys())


# ============================================================================
# DISCOUNT SYSTEM - Following OCP with Strategy Pattern
# ============================================================================

class DiscountStrategy(ABC):
    """
    Abstract base class for discount strategies.
    This allows new discount types to be added without modifying existing code.
    """
    
    @abstractmethod
    def calculate_discount(self, amount: float) -> float:
        """Calculate discount amount."""
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Get description of the discount."""
        pass


class NoDiscount(DiscountStrategy):
    """No discount strategy."""
    
    def calculate_discount(self, amount: float) -> float:
        return 0.0
    
    def get_description(self) -> str:
        return "No discount"


class PercentageDiscount(DiscountStrategy):
    """Percentage-based discount strategy."""
    
    def __init__(self, percentage: float):
        self.percentage = percentage
    
    def calculate_discount(self, amount: float) -> float:
        return amount * (self.percentage / 100)
    
    def get_description(self) -> str:
        return f"{self.percentage}% discount"


class FixedAmountDiscount(DiscountStrategy):
    """Fixed amount discount strategy."""
    
    def __init__(self, discount_amount: float):
        self.discount_amount = discount_amount
    
    def calculate_discount(self, amount: float) -> float:
        return min(self.discount_amount, amount)  # Don't exceed the total amount
    
    def get_description(self) -> str:
        return f"${self.discount_amount:.2f} off"


class TieredDiscount(DiscountStrategy):
    """Tiered discount strategy based on amount thresholds."""
    
    def __init__(self, tiers: List[tuple[float, float]]):
        """
        Initialize with tiers as list of (threshold, percentage) tuples.
        Example: [(100, 5), (500, 10), (1000, 15)] means:
        - 5% off for amounts >= $100
        - 10% off for amounts >= $500
        - 15% off for amounts >= $1000
        """
        # Sort tiers by threshold in descending order
        self.tiers = sorted(tiers, key=lambda x: x[0], reverse=True)
    
    def calculate_discount(self, amount: float) -> float:
        for threshold, percentage in self.tiers:
            if amount >= threshold:
                return amount * (percentage / 100)
        return 0.0
    
    def get_description(self) -> str:
        tier_descriptions = [f"${threshold}+: {percent}%" for threshold, percent in self.tiers]
        return f"Tiered discount ({', '.join(tier_descriptions)})"


# New discount strategies can be added without modifying existing code!
class SeasonalDiscount(DiscountStrategy):
    """Seasonal discount strategy - extends without modification."""
    
    def __init__(self, percentage: float, active_months: List[int]):
        self.percentage = percentage
        self.active_months = active_months
    
    def calculate_discount(self, amount: float) -> float:
        import datetime
        current_month = datetime.datetime.now().month
        if current_month in self.active_months:
            return amount * (self.percentage / 100)
        return 0.0
    
    def get_description(self) -> str:
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        active_months_names = [month_names[m-1] for m in self.active_months]
        return f"{self.percentage}% seasonal discount ({', '.join(active_months_names)})"


class BuyOneGetOneDiscount(DiscountStrategy):
    """BOGO discount strategy - extends without modification."""
    
    def __init__(self, item_price: float):
        self.item_price = item_price
    
    def calculate_discount(self, amount: float) -> float:
        # Calculate how many items can be bought
        num_items = int(amount / self.item_price)
        # For every 2 items, give discount equal to 1 item price
        free_items = num_items // 2
        return free_items * self.item_price
    
    def get_description(self) -> str:
        return f"Buy One Get One Free (item price: ${self.item_price:.2f})"


class DiscountCalculatorGood:
    """
    GOOD: This calculator is CLOSED for modification but OPEN for extension.
    New discount strategies can be added without changing this class.
    """
    
    def __init__(self):
        self._strategies: Dict[str, DiscountStrategy] = {}
    
    def register_strategy(self, name: str, strategy: DiscountStrategy) -> None:
        """Register a new discount strategy."""
        self._strategies[name] = strategy
    
    def calculate_discount(self, amount: float, strategy_name: str) -> tuple[float, str]:
        """Calculate discount using the specified strategy."""
        if strategy_name not in self._strategies:
            raise ValueError(f"Unknown discount strategy: {strategy_name}")
        
        strategy = self._strategies[strategy_name]
        discount = strategy.calculate_discount(amount)
        description = strategy.get_description()
        
        return discount, description
    
    def get_best_discount(self, amount: float) -> tuple[float, str, str]:
        """Find the best discount strategy for the given amount."""
        best_discount = 0.0
        best_strategy_name = ""
        best_description = ""
        
        for name, strategy in self._strategies.items():
            discount = strategy.calculate_discount(amount)
            if discount > best_discount:
                best_discount = discount
                best_strategy_name = name
                best_description = strategy.get_description()
        
        return best_discount, best_strategy_name, best_description
    
    def get_available_strategies(self) -> List[str]:
        """Get list of available discount strategies."""
        return list(self._strategies.keys())


# ============================================================================
# DEMONSTRATION CODE
# ============================================================================

def demonstrate_ocp_violation():
    """Demonstrate the problems with violating OCP."""
    print("=" * 60)
    print("DEMONSTRATING OCP VIOLATION (BAD EXAMPLE)")
    print("=" * 60)
    
    # Shape calculator that violates OCP
    calc = AreaCalculatorBad()
    
    print("Using the BAD AreaCalculator:")
    print("(Notice how adding new shapes requires modifying the calculator)")
    print()
    
    # Calculate areas using the bad approach
    rectangle_area = calc.calculate_area(ShapeType.RECTANGLE, width=5, height=3)
    circle_area = calc.calculate_area(ShapeType.CIRCLE, radius=4)
    triangle_area = calc.calculate_area(ShapeType.TRIANGLE, base=6, height=4)
    
    print(f"Rectangle (5x3): {rectangle_area}")
    print(f"Circle (r=4): {circle_area:.2f}")
    print(f"Triangle (b=6, h=4): {triangle_area}")
    print()
    
    # Try to add a new shape - this would require modifying the calculator!
    try:
        # This will fail because we didn't modify the calculator for squares
        square_area = calc.calculate_area("square", side=4)
    except Exception as e:
        print(f"❌ Error adding new shape: {e}")
    
    print()
    print("PROBLEMS WITH THIS APPROACH:")
    print("1. Must modify existing code to add new shapes")
    print("2. Risk of breaking existing functionality")
    print("3. Code becomes harder to maintain")
    print("4. Violates the Open/Closed Principle")
    print()


def demonstrate_ocp_compliance():
    """Demonstrate the benefits of following OCP."""
    print("=" * 60)
    print("DEMONSTRATING OCP COMPLIANCE (GOOD EXAMPLE)")
    print("=" * 60)
    
    # Create shapes using the good approach
    shapes = [
        Rectangle(5, 3),
        Circle(4),
        Triangle(6, 4),
        Square(4),  # New shape added without modifying existing code!
        Ellipse(5, 3)  # Another new shape!
    ]
    
    calc = AreaCalculatorGood()
    
    print("Using the GOOD AreaCalculator:")
    print("(Notice how new shapes are added without modifying existing code)")
    print()
    
    for shape in shapes:
        area = calc.calculate_area(shape)
        print(f"{shape.get_name()}: {area:.2f}")
    
    print()
    print(f"Total area of all shapes: {calc.calculate_total_area(shapes):.2f}")
    print()
    
    # Generate a detailed report
    report = calc.get_shape_report(shapes)
    print(report)
    
    print("BENEFITS OF THIS APPROACH:")
    print("1. New shapes can be added without modifying existing code")
    print("2. Existing functionality remains untouched and stable")
    print("3. Code is more maintainable and extensible")
    print("4. Follows the Open/Closed Principle")
    print()


def demonstrate_report_generator():
    """Demonstrate the report generator following OCP."""
    print("=" * 60)
    print("REPORT GENERATOR - FOLLOWING OCP")
    print("=" * 60)
    
    # Sample data
    data = [
        {"name": "Alice", "age": 30, "city": "New York"},
        {"name": "Bob", "age": 25, "city": "Los Angeles"},
        {"name": "Charlie", "age": 35, "city": "Chicago"}
    ]
    
    # Create report generator and register formatters
    generator = ReportGeneratorGood()
    generator.register_formatter("text", TextFormatter())
    generator.register_formatter("html", HTMLFormatter())
    generator.register_formatter("json", JSONFormatter())
    
    # New formatters can be added without modifying the generator!
    generator.register_formatter("xml", XMLFormatter())
    generator.register_formatter("csv", CSVFormatter())
    
    print("Available formats:", generator.get_available_formats())
    print()
    
    # Generate reports in different formats
    for format_name in ["text", "json", "xml"]:
        print(f"--- {format_name.upper()} FORMAT ---")
        report = generator.generate_report(data, format_name)
        print(report)
        print()


def demonstrate_discount_system():
    """Demonstrate the discount system following OCP."""
    print("=" * 60)
    print("DISCOUNT SYSTEM - FOLLOWING OCP")
    print("=" * 60)
    
    # Create discount calculator and register strategies
    calculator = DiscountCalculatorGood()
    calculator.register_strategy("none", NoDiscount())
    calculator.register_strategy("premium", PercentageDiscount(10))
    calculator.register_strategy("vip", PercentageDiscount(20))
    calculator.register_strategy("fixed10", FixedAmountDiscount(10))
    calculator.register_strategy("tiered", TieredDiscount([(100, 5), (500, 10), (1000, 15)]))
    
    # New strategies can be added without modifying the calculator!
    calculator.register_strategy("holiday", SeasonalDiscount(15, [11, 12]))  # Nov, Dec
    calculator.register_strategy("bogo", BuyOneGetOneDiscount(25))
    
    print("Available discount strategies:", calculator.get_available_strategies())
    print()
    
    # Test different amounts
    test_amounts = [50, 200, 750, 1200]
    
    for amount in test_amounts:
        print(f"Amount: ${amount}")
        
        # Show all discounts for this amount
        for strategy_name in calculator.get_available_strategies():
            discount, description = calculator.calculate_discount(amount, strategy_name)
            final_amount = amount - discount
            print(f"  {strategy_name}: {description} - Save ${discount:.2f}, Pay ${final_amount:.2f}")
        
        # Find best discount
        best_discount, best_strategy, best_description = calculator.get_best_discount(amount)
        final_amount = amount - best_discount
        print(f"  ⭐ BEST: {best_strategy} ({best_description}) - Save ${best_discount:.2f}, Pay ${final_amount:.2f}")
        print()


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("SOLID Principles in Python - Open/Closed Principle")
    print("=================================================")
    print()
    
    demonstrate_ocp_violation()
    print()
    
    demonstrate_ocp_compliance()
    print()
    
    demonstrate_report_generator()
    print()
    
    demonstrate_discount_system()
    
    print("=" * 60)
    print("KEY TAKEAWAYS:")
    print("=" * 60)
    print("1. Software entities should be OPEN for extension, CLOSED for modification")
    print("2. Use inheritance, composition, and polymorphism to achieve extensibility")
    print("3. Abstract base classes and protocols define contracts for extensions")
    print("4. Strategy pattern is excellent for following OCP")
    print("5. Registration mechanisms allow runtime extension")
    print("6. OCP reduces risk when adding new functionality")
    print("7. 'Don't touch working code' - extend instead of modify")
