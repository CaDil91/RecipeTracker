using Microsoft.EntityFrameworkCore;

namespace FoodBudgetAPI.Data.Repositories;

public class Repository<T>(FoodBudgetDbContext context, ILogger<Repository<T>> logger) : IRepository<T>
    where T : class
{
    protected readonly DbSet<T> DbSet = context.Set<T>();

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await DbSet.ToListAsync();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await DbSet.FindAsync(id);
    }

    public virtual async Task AddAsync(T entity)
    {
        try
        {
            await DbSet.AddAsync(entity);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error adding entity {EntityType}", typeof(T).Name);
            throw;
        }
    }

    public virtual Task UpdateAsync(T entity)
    {
        try
        {
            DbSet.Update(entity);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating entity {EntityType}", typeof(T).Name);
            throw;
        }

        return Task.CompletedTask;
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        try
        {
            T? entity = await GetByIdAsync(id);
            if (entity != null)
            {
                DbSet.Remove(entity);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting entity {EntityType} with id {Id}", typeof(T).Name, id);
            throw;
        }
    }

    public async Task SaveChangesAsync()
    {
        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database update error when saving changes for {EntityType}", typeof(T).Name);
            throw;
        }
    }
}
