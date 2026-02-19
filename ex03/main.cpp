#include "Bureaucrat.hpp"
#include "Intern.hpp"
#include "AForm.hpp"
#include "ShrubberyCreationForm.hpp"
#include "RobotomyRequestForm.hpp"
#include "PresidentialPardonForm.hpp"

int main()
{
	Intern someRandomIntern;

	std::cout << std::endl;
	std::cout << "===== TEST 1: Create robotomy request =====" << std::endl;
	{
		AForm* rrf = someRandomIntern.makeForm("robotomy request", "Bender");
		if (rrf)
		{
			std::cout << *rrf << std::endl;
			Bureaucrat boss("Boss", 1);
			boss.signForm(*rrf);
			boss.executeForm(*rrf);
			delete rrf;
		}
	}

	std::cout << std::endl;
	std::cout << "===== TEST 2: Create shrubbery creation =====" << std::endl;
	{
		AForm* scf = someRandomIntern.makeForm("shrubbery creation", "garden");
		if (scf)
		{
			std::cout << *scf << std::endl;
			Bureaucrat bob("Bob", 1);
			bob.signForm(*scf);
			bob.executeForm(*scf);
			delete scf;
		}
	}

	std::cout << std::endl;
	std::cout << "===== TEST 3: Create presidential pardon =====" << std::endl;
	{
		AForm* ppf = someRandomIntern.makeForm("presidential pardon", "Arthur Dent");
		if (ppf)
		{
			std::cout << *ppf << std::endl;
			Bureaucrat president("President", 1);
			president.signForm(*ppf);
			president.executeForm(*ppf);
			delete ppf;
		}
	}

	std::cout << std::endl;
	std::cout << "===== TEST 4: Create unknown form =====" << std::endl;
	{
		AForm* unknown = someRandomIntern.makeForm("unknown form", "target");
		if (unknown)
			delete unknown;
		else
			std::cout << "Form pointer is NULL" << std::endl;
	}

	std::cout << std::endl;
	return 0;
}
