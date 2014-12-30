class Interpreter

  def marks_in_text(text)
    marks = Mark.all.map{|q| q.name}
    text = text.downcase.gsub(/[^A-Za-z0-9\s]/i, '')
    words = text.split(' ')
    words.select{|a| marks.include?(a)}
  end

  def mark_vector_from_text(text)
    marks = marks_in_text(text)
    vector = []
    marks.each do |mark|
      m = Mark.find_by(name: mark)
      vector.append([m.id, 1])
      vector = QueryMarks.new.add_mark_vectors(vector, QueryMarks.new.scale_mark_vector(m.correlated_marks, 0.2))
    end

    s=Math.sqrt(vector.sum{|a| a[1]**2})
    vector.map{|a| [a[0], a[1]/s.to_f] }
  end

  def suggested_bountys_from_text(text)
    user_vector = mark_vector_from_text(text)
    all_wip_vectors = QueryMarks.new.get_all_wip_vectors
    result = []

    all_wip_vectors.each do |data|
      vector = data[1]
      wip_id = data[0]
      correlation = QueryMarks.new.dot_product_vectors(user_vector, vector)
      if correlation > 0
        wip = Wip.find(wip_id)
        result.append([correlation.to_f, wip])
      end
    end

    n=0
    result.sort_by{|a, b| a}.reverse
  end

end
