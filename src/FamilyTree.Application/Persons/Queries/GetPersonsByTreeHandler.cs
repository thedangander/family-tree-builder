using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Persons.Queries;

/// <summary>
/// Wolverine handler for GetPersonsByTreeQuery.
/// </summary>
public class GetPersonsByTreeHandler
{
    private readonly IPersonRepository _personRepository;

    public GetPersonsByTreeHandler(IPersonRepository personRepository)
    {
        _personRepository = personRepository;
    }

    public async Task<IEnumerable<PersonDto>> Handle(GetPersonsByTreeQuery query, CancellationToken cancellationToken)
    {
        var persons = await _personRepository.GetByTreeIdAsync(query.TreeId, cancellationToken);
        return persons.Select(p => p.ToDto());
    }
}
