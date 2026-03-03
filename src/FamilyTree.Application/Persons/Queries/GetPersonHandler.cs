using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Persons.Queries;

/// <summary>
/// Wolverine handler for GetPersonQuery.
/// </summary>
public class GetPersonHandler
{
    private readonly IPersonRepository _personRepository;

    public GetPersonHandler(IPersonRepository personRepository)
    {
        _personRepository = personRepository;
    }

    public async Task<Result<PersonDto>> Handle(GetPersonQuery query, CancellationToken cancellationToken)
    {
        var person = await _personRepository.GetByIdAsync(query.Id, cancellationToken);
        if (person == null)
        {
            return Result<PersonDto>.Failure("Person not found");
        }

        return Result<PersonDto>.Success(person.ToDto());
    }
}
