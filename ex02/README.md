# Exercise 02 : No, you need form 28B, not 28C...

## 📚 Concept

Cet exercice introduit les **classes abstraites** et le **polymorphisme**. La classe `Form` est renommée `AForm` (Abstract Form) et devient une **classe abstraite** (non instanciable). Trois classes concrètes en héritent et implémentent chacune une action différente.

### Notions clés :
- **Classe abstraite** : contient au moins une **fonction virtuelle pure** (`= 0`)
- **Polymorphisme** : appeler `execute()` sur un `AForm*` exécute l'action de la classe dérivée
- **Héritage** : les 3 formulaires héritent de `AForm`
- **Destructeur virtuel** : `virtual ~AForm()` pour la destruction correcte via pointeur de base

### Les 3 formulaires concrets :

| Formulaire | Sign | Exec | Action |
|-----------|------|------|--------|
| `ShrubberyCreationForm` | 145 | 137 | Crée un fichier `<target>_shrubbery` avec des arbres ASCII |
| `RobotomyRequestForm` | 72 | 45 | 50% de chance de robotomiser la cible |
| `PresidentialPardonForm` | 25 | 5 | La cible est pardonnée par Zaphod Beeblebrox |

---

## 📁 Fichiers

| Fichier | Description |
|---------|------------|
| `AForm.hpp/cpp` | Classe abstraite de base |
| `ShrubberyCreationForm.hpp/cpp` | Crée un fichier avec des arbres ASCII |
| `RobotomyRequestForm.hpp/cpp` | Robotomise la cible (50% chance) |
| `PresidentialPardonForm.hpp/cpp` | Pardon présidentiel |
| `Bureaucrat.hpp/cpp` | Bureaucrate avec `executeForm()` |
| `main.cpp` | Tests |
| `Makefile` | Compilation |

---

## 🔍 Explication du code ligne par ligne

### AForm.hpp — La classe abstraite

```cpp
class AForm
{
    private:
        const std::string _name;      // Nom du formulaire
        bool              _signed;    // Est-il signé ?
        const int         _gradeToSign; // Grade minimum pour signer
        const int         _gradeToExec; // Grade minimum pour exécuter

    public:
        // ... constructeurs, getters ...

        void beSigned(const Bureaucrat& b);  // Le bureaucrate signe
        void execute(Bureaucrat const& executor) const; // Vérifie + exécute

        // Exceptions
        class FormNotSignedException : public std::exception { /* ... */ };

    protected:
        virtual void action() const = 0; // PURE VIRTUAL : chaque forme implémente sa propre action
        // "= 0" rend la classe abstraite → impossible d'instancier AForm directement
};
```

### AForm.cpp — execute() vérifie les conditions dans la base

```cpp
void AForm::execute(Bureaucrat const& executor) const
{
    if (!_signed)                        // 1. Le formulaire doit être signé
        throw AForm::FormNotSignedException();
    if (executor.getGrade() > _gradeToExec) // 2. Le grade doit être suffisant
        throw AForm::GradeTooLowException();
    action();                            // 3. Si OK, appelle l'action de la classe dérivée
}
```

### ShrubberyCreationForm.cpp — Crée des arbres ASCII

```cpp
void ShrubberyCreationForm::action() const
{
    std::ofstream file((_target + "_shrubbery").c_str()); // Ouvre le fichier
    // Écrit des arbres ASCII dans le fichier
    file << "         *         " << std::endl;
    file << "        /|\\       " << std::endl;
    // ... etc
    file.close();
}
```

### RobotomyRequestForm.cpp — 50% de chance

```cpp
void RobotomyRequestForm::action() const
{
    std::cout << "* DRILLING NOISES * Bzzzzzzz..." << std::endl;
    std::srand(std::time(NULL));     // Initialise le générateur aléatoire
    if (std::rand() % 2)            // 50% de chance
        std::cout << _target << " has been robotomized successfully!" << std::endl;
    else
        std::cout << _target << " robotomy failed!" << std::endl;
}
```

### PresidentialPardonForm.cpp — Simple message

```cpp
void PresidentialPardonForm::action() const
{
    std::cout << _target << " has been pardoned by Zaphod Beeblebrox." << std::endl;
}
```

### Bureaucrat::executeForm()

```cpp
void Bureaucrat::executeForm(AForm const& form) const
{
    try {
        form.execute(*this);       // Appelle AForm::execute() → vérifie → appelle action()
        std::cout << _name << " executed " << form.getName() << std::endl;
    }
    catch (std::exception& e) {
        std::cout << _name << " couldn't execute " << form.getName()
                  << " because " << e.what() << std::endl;
    }
}
```

---

## 🔨 Compilation et exécution

```bash
make          # Compile
./aform       # Exécute
cat home_shrubbery  # Vérifie le fichier créé par ShrubberyCreationForm
make fclean   # Nettoie
```

---

## 📊 Sortie attendue

```
===== TEST 1: ShrubberyCreationForm =====
Bob signed ShrubberyCreationForm
Bob executed ShrubberyCreationForm
Check file: home_shrubbery

===== TEST 2: RobotomyRequestForm =====
Alice signed RobotomyRequestForm
* DRILLING NOISES * Bzzzzzzz...
Bender has been robotomized successfully!   (ou "robotomy failed!")
Alice executed RobotomyRequestForm

===== TEST 3: PresidentialPardonForm =====
President signed PresidentialPardonForm
Arthur Dent has been pardoned by Zaphod Beeblebrox.
President executed PresidentialPardonForm

===== TEST 4: Execute unsigned form =====
Charlie couldn't execute ShrubberyCreationForm because Form is not signed!

===== TEST 5: Grade too low to sign =====
Intern couldn't sign PresidentialPardonForm because Grade is too low!

===== TEST 6: Grade too low to execute =====
Boss signed RobotomyRequestForm
Low couldn't execute RobotomyRequestForm because Grade is too low!
```
