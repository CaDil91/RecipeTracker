using AutoMapper;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;

namespace FoodBudgetAPI.Mapping;

public class ImageMappingProfile : Profile
{
    public ImageMappingProfile()
    {
        CreateMap<UploadTokenResponse, ImageUploadTokenResponseDto>();
    }
}