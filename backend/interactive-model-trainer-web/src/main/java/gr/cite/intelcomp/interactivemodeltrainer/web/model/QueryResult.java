package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import java.util.ArrayList;
import java.util.List;

public class QueryResult<M> {
	public QueryResult() { }

	public QueryResult(List<M> items, long count, long countOverride) {
		this.items = items;
		this.count = count;
		this.countOverride = countOverride;
	}

	public QueryResult(List<M> items, long count)
	{
		this.items = items;
		this.count = count;
		this.countOverride = 0;
	}

	public QueryResult(List<M> items)
	{
		this.items = items;
		if (items != null) this.count = items.size();
		else this.count = 0;
	}

	private List<M> items;
	private long count;
	private long countOverride;

	public List<M> getItems() {
		return items;
	}

	public void setItems(List<M> items) {
		this.items = items;
	}

	public long getCount() {
		return count;
	}

	public void setCount(long count) {
		this.count = count;
	}

	public long getCountOverride() {
		return countOverride;
	}

	public void setCountOverride(long countOverride) {
		this.countOverride = countOverride;
	}

	public static QueryResult<?> Empty()
	{
		return new QueryResult<>(new ArrayList<>(), 0L);
	}
}
