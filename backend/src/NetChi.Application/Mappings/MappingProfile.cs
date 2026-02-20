using AutoMapper;
using NetChi.Domain.Entities;
using NetChi.Application.DTOs.Auth;
using NetChi.Application.DTOs.Orders;

namespace NetChi.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<Order, OrderDto>();
        CreateMap<CreateOrderRequest, Order>();
        CreateMap<UpdateOrderRequest, Order>();
    }
}
