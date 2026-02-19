#include "Intern.hpp"
#include "ShrubberyCreationForm.hpp"
#include "RobotomyRequestForm.hpp"
#include "PresidentialPardonForm.hpp"

Intern::Intern()
{
	std::cout << "Intern default constructor called" << std::endl;
}

Intern::Intern(const Intern& other)
{
	(void)other;
	std::cout << "Intern copy constructor called" << std::endl;
}

Intern& Intern::operator=(const Intern& other)
{
	(void)other;
	std::cout << "Intern assignment operator called" << std::endl;
	return *this;
}

Intern::~Intern()
{
	std::cout << "Intern destructor called" << std::endl;
}

AForm* Intern::createShrubbery(const std::string& target)
{
	return new ShrubberyCreationForm(target);
}

AForm* Intern::createRobotomy(const std::string& target)
{
	return new RobotomyRequestForm(target);
}

AForm* Intern::createPresidential(const std::string& target)
{
	return new PresidentialPardonForm(target);
}

AForm* Intern::makeForm(const std::string& name, const std::string& target)
{
	std::string formNames[] = {
		"shrubbery creation",
		"robotomy request",
		"presidential pardon"
	};

	typedef AForm* (Intern::*FormCreator)(const std::string&);
	FormCreator creators[] = {
		&Intern::createShrubbery,
		&Intern::createRobotomy,
		&Intern::createPresidential
	};

	for (int i = 0; i < 3; i++)
	{
		if (name == formNames[i])
		{
			AForm* form = (this->*creators[i])(target);
			std::cout << "Intern creates " << form->getName() << std::endl;
			return form;
		}
	}
	std::cout << "Intern couldn't create form: \"" << name
			  << "\" does not exist." << std::endl;
	return NULL;
}
