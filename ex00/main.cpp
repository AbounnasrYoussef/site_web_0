#include "Bureaucrat.hpp"

int main()
{
	std::cout << "===== TEST 1: Valid Bureaucrat =====" << std::endl;
	try
	{
		Bureaucrat b1("Alice", 42);
		std::cout << b1 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 2: Grade too high (0) =====" << std::endl;
	try
	{
		Bureaucrat b2("Bob", 0);
		std::cout << b2 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 3: Grade too low (151) =====" << std::endl;
	try
	{
		Bureaucrat b3("Charlie", 151);
		std::cout << b3 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 4: Increment grade =====" << std::endl;
	try
	{
		Bureaucrat b4("Diana", 2);
		std::cout << b4 << std::endl;
		b4.incrementGrade();
		std::cout << "After increment: " << b4 << std::endl;
		b4.incrementGrade(); // Should throw: grade would become 0
		std::cout << b4 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 5: Decrement grade =====" << std::endl;
	try
	{
		Bureaucrat b5("Eve", 149);
		std::cout << b5 << std::endl;
		b5.decrementGrade();
		std::cout << "After decrement: " << b5 << std::endl;
		b5.decrementGrade(); // Should throw: grade would become 151
		std::cout << b5 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 6: Copy constructor =====" << std::endl;
	try
	{
		Bureaucrat original("Frank", 75);
		Bureaucrat copy(original);
		std::cout << "Original: " << original << std::endl;
		std::cout << "Copy:     " << copy << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	return 0;
}
