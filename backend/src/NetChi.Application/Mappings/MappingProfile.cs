using AutoMapper;
using NetChi.Domain.Entities;
using NetChi.Application.DTOs.Auth;

namespace NetChi.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();
    }
}
