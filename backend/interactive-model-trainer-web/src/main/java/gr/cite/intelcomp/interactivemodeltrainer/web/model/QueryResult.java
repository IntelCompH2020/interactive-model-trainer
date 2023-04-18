package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import java.util.ArrayList;
import java.util.List;

public class QueryResult<M> {
	public QueryResult() { }
	public QueryResult(List<M> items, long count)
	{
		this.items = items;
		this.count = count;
	}
	public QueryResult(List<M> items)
	{
		this.items = items;
		if (items != null) this.count = items.size();
		else this.count = 0;
	}

	public List<M> items;
	public long count;

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

	public static QueryResult<?> Empty()
	{
		return new QueryResult<>(new ArrayList<>(), 0L);
	}
}
