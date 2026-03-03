using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Persons.Commands;

/// <summary>
/// Wolverine handler for UpdatePersonCommand.
/// </summary>
public class UpdatePersonHandler
{
    private readonly IPersonRepository _personRepository;

    public UpdatePersonHandler(IPersonRepository personRepository)
    {
        _personRepository = personRepository;
    }

    public async Task<Result<PersonDto>> Handle(UpdatePersonCommand command, CancellationToken cancellationToken)
    {
        var person = await _personRepository.GetByIdAsync(command.Id, cancellationToken);
        if (person == null)
        {
            return Result<PersonDto>.Failure("Person not found");
        }

        // Apply updates only for non-null values
        // Empty strings are valid and will clear the field
        if (command.FirstName != null) person.FirstName = command.FirstName;
        if (command.LastName != null) person.LastName = command.LastName;
        if (command.MaidenName != null) person.MaidenName = string.IsNullOrEmpty(command.MaidenName) ? null : command.MaidenName;
        if (command.Gender.HasValue) person.Gender = command.Gender.Value;
        if (command.DateOfBirth.HasValue) person.DateOfBirth = command.DateOfBirth.Value;
        if (command.DateOfDeath.HasValue) person.DateOfDeath = command.DateOfDeath.Value;
        if (command.PlaceOfBirth != null) person.PlaceOfBirth = string.IsNullOrEmpty(command.PlaceOfBirth) ? null : command.PlaceOfBirth;
        if (command.PlaceOfDeath != null) person.PlaceOfDeath = string.IsNullOrEmpty(command.PlaceOfDeath) ? null : command.PlaceOfDeath;
        if (command.Biography != null) person.Biography = string.IsNullOrEmpty(command.Biography) ? null : command.Biography;
        if (command.PhotoUrl != null) person.PhotoUrl = string.IsNullOrEmpty(command.PhotoUrl) ? null : command.PhotoUrl;
        if (command.Occupation != null) person.Occupation = string.IsNullOrEmpty(command.Occupation) ? null : command.Occupation;
        if (command.Email != null) person.Email = string.IsNullOrEmpty(command.Email) ? null : command.Email;
        if (command.Phone != null) person.Phone = string.IsNullOrEmpty(command.Phone) ? null : command.Phone;
        if (command.PositionX.HasValue) person.PositionX = command.PositionX.Value;
        if (command.PositionY.HasValue) person.PositionY = command.PositionY.Value;

        person.UpdatedAt = DateTime.UtcNow;

        var updated = await _personRepository.UpdateAsync(person, cancellationToken);
        return Result<PersonDto>.Success(updated.ToDto());
    }
}
