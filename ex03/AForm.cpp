#include "AForm.hpp"
#include "Bureaucrat.hpp"

AForm::AForm() : _name("Default Form"), _signed(false), _gradeToSign(150), _gradeToExec(150)
{
	std::cout << "AForm default constructor called" << std::endl;
}

AForm::AForm(const std::string& name, int gradeToSign, int gradeToExec)
	: _name(name), _signed(false), _gradeToSign(gradeToSign), _gradeToExec(gradeToExec)
{
	if (gradeToSign < 1 || gradeToExec < 1)
		throw AForm::GradeTooHighException();
	if (gradeToSign > 150 || gradeToExec > 150)
		throw AForm::GradeTooLowException();
	std::cout << "AForm parameterized constructor called" << std::endl;
}

AForm::AForm(const AForm& other)
	: _name(other._name), _signed(other._signed),
	  _gradeToSign(other._gradeToSign), _gradeToExec(other._gradeToExec)
{
	std::cout << "AForm copy constructor called" << std::endl;
}

AForm& AForm::operator=(const AForm& other)
{
	if (this != &other)
		_signed = other._signed;
	std::cout << "AForm assignment operator called" << std::endl;
	return *this;
}

AForm::~AForm()
{
	std::cout << "AForm destructor called" << std::endl;
}

const std::string& AForm::getName() const
{
	return _name;
}

bool AForm::getSigned() const
{
	return _signed;
}

int AForm::getGradeToSign() const
{
	return _gradeToSign;
}

int AForm::getGradeToExec() const
{
	return _gradeToExec;
}

void AForm::beSigned(const Bureaucrat& b)
{
	if (b.getGrade() > _gradeToSign)
		throw AForm::GradeTooLowException();
	_signed = true;
}

void AForm::execute(Bureaucrat const& executor) const
{
	if (!_signed)
		throw AForm::FormNotSignedException();
	if (executor.getGrade() > _gradeToExec)
		throw AForm::GradeTooLowException();
	action();
}

const char* AForm::GradeTooHighException::what() const throw()
{
	return "Grade is too high!";
}

const char* AForm::GradeTooLowException::what() const throw()
{
	return "Grade is too low!";
}

const char* AForm::FormNotSignedException::what() const throw()
{
	return "Form is not signed!";
}

std::ostream& operator<<(std::ostream& os, const AForm& f)
{
	os << "Form " << f.getName()
	   << " | Signed: " << (f.getSigned() ? "Yes" : "No")
	   << " | Grade to sign: " << f.getGradeToSign()
	   << " | Grade to execute: " << f.getGradeToExec();
	return os;
}
