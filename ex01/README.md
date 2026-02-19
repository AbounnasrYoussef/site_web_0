# Exercise 01 : Form up, maggots!

## 📚 Concept

Cet exercice ajoute la classe `Form` au projet. Un formulaire possède un **nom**, un **statut signé**, un **grade requis pour signer** et un **grade requis pour exécuter**. La relation entre `Bureaucrat` et `Form` illustre **l'interaction entre objets** et la **gestion d'exceptions**.

### Notions clés :
- **Encapsulation** : tous les attributs de `Form` sont `private`
- **Forward declaration** : déclarer une classe avant de l'utiliser dans un header
- **Interaction entre classes** : `Bureaucrat::signForm()` appelle `Form::beSigned()`
- **Gestion d'erreurs** : exceptions si le grade est insuffisant

---

## 📁 Fichiers

| Fichier | Description |
|---------|------------|
| `Bureaucrat.hpp/cpp` | Classe Bureaucrat (ajout de `signForm()`) |
| `Form.hpp/cpp` | Classe Form avec `beSigned()` |
| `main.cpp` | Tests |
| `Makefile` | Compilation |

---

## 🔍 Explication du code ligne par ligne

### Form.hpp

```cpp
#ifndef FORM_HPP
# define FORM_HPP

# include <iostream>
# include <string>
# include <stdexcept>

class Bureaucrat;   // Forward declaration : on sait que Bureaucrat existe
                    // sans inclure son header (évite les inclusions circulaires)

class Form
{
    private:
        const std::string _name;       // Nom du formulaire (constant)
        bool              _signed;     // Statut : signé ou non (false au départ)
        const int         _gradeToSign;// Grade minimum requis pour signer
        const int         _gradeToExec;// Grade minimum requis pour exécuter

    public:
        // Orthodox Canonical Form
        Form();
        Form(const std::string& name, int gradeToSign, int gradeToExec);
        Form(const Form& other);
        Form& operator=(const Form& other);
        ~Form();

        // Getters
        const std::string& getName() const;
        bool               getSigned() const;
        int                getGradeToSign() const;
        int                getGradeToExec() const;

        // beSigned : le bureaucrate tente de signer le formulaire
        void beSigned(const Bureaucrat& b);

        // Exceptions
        class GradeTooHighException : public std::exception {
            public: virtual const char* what() const throw();
        };
        class GradeTooLowException : public std::exception {
            public: virtual const char* what() const throw();
        };
};

std::ostream& operator<<(std::ostream& os, const Form& f);
#endif
```

### Form.cpp

```cpp
#include "Form.hpp"
#include "Bureaucrat.hpp"

// Constructeur paramétré : initialise nom, grades, signed=false
Form::Form(const std::string& name, int gradeToSign, int gradeToExec)
    : _name(name), _signed(false), _gradeToSign(gradeToSign), _gradeToExec(gradeToExec)
{
    if (gradeToSign < 1 || gradeToExec < 1)   // Grade < 1 → trop haut
        throw Form::GradeTooHighException();
    if (gradeToSign > 150 || gradeToExec > 150)// Grade > 150 → trop bas
        throw Form::GradeTooLowException();
}

// beSigned : vérifie que le grade du Bureaucrat est suffisant
void Form::beSigned(const Bureaucrat& b)
{
    if (b.getGrade() > _gradeToSign)  // Grade 100 > Grade requis 50 → refusé
        throw Form::GradeTooLowException();
    _signed = true;                    // Sinon, on signe
}

// operator<< : affiche toutes les informations du formulaire
std::ostream& operator<<(std::ostream& os, const Form& f)
{
    os << "Form " << f.getName()
       << " | Signed: " << (f.getSigned() ? "Yes" : "No")
       << " | Grade to sign: " << f.getGradeToSign()
       << " | Grade to execute: " << f.getGradeToExec();
    return os;
}
```

### Bureaucrat.cpp (ajout)

```cpp
// signForm : tente de signer le formulaire, affiche le résultat
void Bureaucrat::signForm(Form& form)
{
    try
    {
        form.beSigned(*this);    // Tente de signer
        std::cout << _name << " signed " << form.getName() << std::endl;
    }
    catch (std::exception& e)   // Si exception (grade trop bas)
    {
        std::cout << _name << " couldn't sign " << form.getName()
                  << " because " << e.what() << std::endl;
    }
}
```

---

## 🔨 Compilation et exécution

```bash
make          # Compile avec c++ -Wall -Wextra -Werror -std=c++98
./form        # Exécute le programme
make clean    # Supprime les fichiers objets (.o)
make fclean   # Supprime tout (objets + exécutable)
make re       # Recompile tout
```

---

## 📊 Sortie attendue

```
===== TEST 1: Create a valid Form =====
Form Tax Form A28 | Signed: No | Grade to sign: 50 | Grade to execute: 25

===== TEST 2: Form with invalid grade (too high) =====
Exception: Grade is too high!

===== TEST 3: Form with invalid grade (too low) =====
Exception: Grade is too low!

===== TEST 4: Bureaucrat signs a Form (success) =====
Alice signed Access Form
Form Access Form | Signed: Yes | Grade to sign: 50 | Grade to execute: 25

===== TEST 5: Bureaucrat signs a Form (failure) =====
Bob couldn't sign Top Secret Form because Grade is too low!
Form Top Secret Form | Signed: No | Grade to sign: 10 | Grade to execute: 5

===== TEST 6: Copy Form =====
Original: Form Original Form | Signed: No | Grade to sign: 42 | Grade to execute: 21
Copy:     Form Original Form | Signed: No | Grade to sign: 42 | Grade to execute: 21
```
