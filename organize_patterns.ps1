# Script to organize patterns into categories
# Creates category folders and moves patterns accordingly

$basePath = "Patterns in JS and Node"

# Create category folders
Write-Host "Creating category folders..."
New-Item -Path "$basePath/Creational" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath/Structural" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath/Behavioral" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath/DataAccess" -ItemType Directory -Force | Out-Null
Write-Host "✓ Category folders created`n"

# Define pattern mappings
$creational = @(
    "AbstractFactory",
    "Builder",
    "Factory",
    "FactoryMethod",
    "Pool",
    "PrototypePattern",
    "Singleton"
)

$structural = @(
    "Adapter",
    "Boxing",
    "Bridge",
    "Composite",
    "Decorator",
    "Facade",
    "Flyweight",
    "Proxy",
    "Wrapper"
)

$behavioral = @(
    "Actor",
    "ChainOfResponsibility",
    "Command",
    "EventEmitter",
    "Events",
    "Interpreter",
    "Iterator",
    "Mediator",
    "Memento",
    "Observer",
    "Proactor",
    "Reactor",
    "RevealingConstructor",
    "Signals",
    "State",
    "Strategy",
    "TemplateMethod",
    "Visitor"
)

$dataAccess = @(
    "ActiveRecord",
    "Repository",
    "TransactionScript",
    "ValueObject"
)

# Move patterns to Creational
Write-Host "Moving Creational patterns (7)..."
foreach ($pattern in $creational) {
    $source = Join-Path $basePath $pattern
    $dest = Join-Path "$basePath/Creational" $pattern
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest
        Write-Host "  ✓ $pattern -> Creational/"
    }
}

# Move patterns to Structural
Write-Host "`nMoving Structural patterns (9)..."
foreach ($pattern in $structural) {
    $source = Join-Path $basePath $pattern
    $dest = Join-Path "$basePath/Structural" $pattern
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest
        Write-Host "  ✓ $pattern -> Structural/"
    }
}

# Move patterns to Behavioral
Write-Host "`nMoving Behavioral patterns (18)..."
foreach ($pattern in $behavioral) {
    $source = Join-Path $basePath $pattern
    $dest = Join-Path "$basePath/Behavioral" $pattern
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest
        Write-Host "  ✓ $pattern -> Behavioral/"
    }
}

# Move patterns to DataAccess
Write-Host "`nMoving DataAccess patterns (4)..."
foreach ($pattern in $dataAccess) {
    $source = Join-Path $basePath $pattern
    $dest = Join-Path "$basePath/DataAccess" $pattern
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest
        Write-Host "  ✓ $pattern -> DataAccess/"
    }
}

Write-Host "`n✓ Organization completed successfully!"
Write-Host "`nSummary:"
Write-Host "  Creational: 7 patterns"
Write-Host "  Structural: 9 patterns"
Write-Host "  Behavioral: 18 patterns"
Write-Host "  DataAccess: 4 patterns"
Write-Host "  Total: 38 patterns organized"