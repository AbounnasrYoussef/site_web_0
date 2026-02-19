#ifndef BUREAUCRAT_HPP
# define BUREAUCRAT_HPP

# include <iostream>
# include <string>
# include <stdexcept>

class Bureaucrat
{
	private:
		const std::string	_name;
		int					_grade;

	public:
		// --- Orthodox Canonical Form ---
		Bureaucrat();
		Bureaucrat(const std::string& name, int grade);
		Bureaucrat(const Bureaucrat& other);
		Bureaucrat& operator=(const Bureaucrat& other);
		~Bureaucrat();

		// --- Getters ---
		const std::string&	getName() const;
		int					getGrade() const;

		// --- Grade modifiers ---
		void	incrementGrade();
		void	decrementGrade();

		// --- Exception classes ---
		class GradeTooHighException : public std::exception
		{
			public:
				virtual const char* what() const throw();
		};

		class GradeTooLowException : public std::exception
		{
			public:
				virtual const char* what() const throw();
		};
};

// --- Insertion operator overload ---
std::ostream& operator<<(std::ostream& os, const Bureaucrat& b);

#endif
