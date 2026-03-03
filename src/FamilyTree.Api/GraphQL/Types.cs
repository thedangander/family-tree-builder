using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Entities;
using HotChocolate.Types;

namespace FamilyTree.Api.GraphQL;

public class PersonType : ObjectType<PersonDto>
{
    protected override void Configure(IObjectTypeDescriptor<PersonDto> descriptor)
    {
        descriptor.Name("Person");
        
        descriptor.Field(p => p.Id).Type<NonNullType<IdType>>();
        descriptor.Field(p => p.TreeId).Type<NonNullType<IdType>>();
        descriptor.Field(p => p.FirstName).Type<NonNullType<StringType>>();
        descriptor.Field(p => p.LastName).Type<NonNullType<StringType>>();
        descriptor.Field(p => p.FullName).Type<NonNullType<StringType>>();
        descriptor.Field(p => p.Gender).Type<NonNullType<GenderType>>();
        descriptor.Field(p => p.IsAlive).Type<NonNullType<BooleanType>>();
        descriptor.Field(p => p.PositionX).Type<NonNullType<FloatType>>();
        descriptor.Field(p => p.PositionY).Type<NonNullType<FloatType>>();
    }
}

public class GenderType : EnumType<Gender>
{
    protected override void Configure(IEnumTypeDescriptor<Gender> descriptor)
    {
        descriptor.Name("Gender");
        descriptor.Value(Gender.Unknown).Name("UNKNOWN");
        descriptor.Value(Gender.Male).Name("MALE");
        descriptor.Value(Gender.Female).Name("FEMALE");
        descriptor.Value(Gender.Other).Name("OTHER");
    }
}

public class DocumentType : ObjectType<DocumentDto>
{
    protected override void Configure(IObjectTypeDescriptor<DocumentDto> descriptor)
    {
        descriptor.Name("Document");
        
        descriptor.Field(d => d.Id).Type<NonNullType<IdType>>();
        descriptor.Field(d => d.Name).Type<NonNullType<StringType>>();
        descriptor.Field(d => d.DocumentType).Type<NonNullType<DocumentTypeEnum>>();
        descriptor.Field(d => d.FileUrl).Type<NonNullType<StringType>>();
    }
}

public class DocumentTypeEnum : EnumType<Domain.Entities.DocumentType>
{
    protected override void Configure(IEnumTypeDescriptor<Domain.Entities.DocumentType> descriptor)
    {
        descriptor.Name("DocumentType");
        descriptor.Value(Domain.Entities.DocumentType.Other).Name("OTHER");
        descriptor.Value(Domain.Entities.DocumentType.BirthCertificate).Name("BIRTH_CERTIFICATE");
        descriptor.Value(Domain.Entities.DocumentType.DeathCertificate).Name("DEATH_CERTIFICATE");
        descriptor.Value(Domain.Entities.DocumentType.MarriageCertificate).Name("MARRIAGE_CERTIFICATE");
        descriptor.Value(Domain.Entities.DocumentType.DivorceCertificate).Name("DIVORCE_CERTIFICATE");
        descriptor.Value(Domain.Entities.DocumentType.Photo).Name("PHOTO");
        descriptor.Value(Domain.Entities.DocumentType.Letter).Name("LETTER");
        descriptor.Value(Domain.Entities.DocumentType.WillTestament).Name("WILL_TESTAMENT");
        descriptor.Value(Domain.Entities.DocumentType.MilitaryRecord).Name("MILITARY_RECORD");
        descriptor.Value(Domain.Entities.DocumentType.ImmigrationRecord).Name("IMMIGRATION_RECORD");
        descriptor.Value(Domain.Entities.DocumentType.Census).Name("CENSUS");
    }
}

public class RelationshipType : ObjectType<RelationshipDto>
{
    protected override void Configure(IObjectTypeDescriptor<RelationshipDto> descriptor)
    {
        descriptor.Name("Relationship");
        
        descriptor.Field(r => r.Id).Type<NonNullType<IdType>>();
        descriptor.Field(r => r.TreeId).Type<NonNullType<IdType>>();
        descriptor.Field(r => r.FromPersonId).Type<NonNullType<IdType>>();
        descriptor.Field(r => r.ToPersonId).Type<NonNullType<IdType>>();
        descriptor.Field(r => r.RelationshipType).Type<NonNullType<RelationshipTypeEnum>>();
        descriptor.Field(r => r.Documents).Type<NonNullType<ListType<NonNullType<DocumentType>>>>();
    }
}

public class RelationshipTypeEnum : EnumType<Domain.Entities.RelationshipType>
{
    protected override void Configure(IEnumTypeDescriptor<Domain.Entities.RelationshipType> descriptor)
    {
        descriptor.Name("RelationshipType");
        descriptor.Value(Domain.Entities.RelationshipType.Parent).Name("PARENT");
        descriptor.Value(Domain.Entities.RelationshipType.Spouse).Name("SPOUSE");
    }
}

public class TreeType : ObjectType<TreeDto>
{
    protected override void Configure(IObjectTypeDescriptor<TreeDto> descriptor)
    {
        descriptor.Name("Tree");
        
        descriptor.Field(t => t.Id).Type<NonNullType<IdType>>();
        descriptor.Field(t => t.Name).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.OwnerId).Type<NonNullType<IdType>>();
        descriptor.Field(t => t.IsPublic).Type<NonNullType<BooleanType>>();
    }
}
