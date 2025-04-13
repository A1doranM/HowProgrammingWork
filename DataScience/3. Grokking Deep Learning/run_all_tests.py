"""
Run all tests for the deep learning framework.
This script executes all the test files and reports the overall results.
"""

import subprocess
import sys
import os


def run_test_file(test_file_path):
    """
    Run a single test file and return success status.
    
    Parameters
    ----------
    test_file_path : str
        Path to the test file to run
        
    Returns
    -------
    bool
        True if the test succeeded, False otherwise
    """
    print(f"\n{'='*60}")
    print(f"Running: {test_file_path}")
    print(f"{'='*60}")
    
    result = subprocess.run(
        [sys.executable, test_file_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Print the output
    print(result.stdout)
    if result.stderr:
        print("ERRORS:")
        print(result.stderr)
    
    return result.returncode == 0


def main():
    """Run all the test files and report the overall result."""
    # Get the directory of this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tests_dir = os.path.join(base_dir, 'tests')
    
    # Individual test files
    test_files = [
        os.path.join(tests_dir, 'test_tensor.py'),
        os.path.join(tests_dir, 'test_layers.py'),
        os.path.join(tests_dir, 'test_losses.py'),
        os.path.join(tests_dir, 'test_optim.py')
    ]
    
    # Also include the standalone test_framework.py
    test_files.append(os.path.join(base_dir, 'test_framework.py'))
    
    # Run each test file
    results = {}
    all_passed = True
    
    for test_file in test_files:
        # Skip files that don't exist
        if not os.path.exists(test_file):
            print(f"Warning: Test file not found: {test_file}")
            continue
            
        success = run_test_file(test_file)
        results[os.path.basename(test_file)] = success
        all_passed = all_passed and success
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_file, success in results.items():
        status = "PASSED" if success else "FAILED"
        print(f"{test_file}: {status}")
    
    print("\nOVERALL RESULT:", "PASSED" if all_passed else "FAILED")
    
    # Return exit code
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
